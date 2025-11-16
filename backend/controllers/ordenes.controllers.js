const { pool } = require('../services/dbConnection');
const { sendMailWithPdf } = require('../services/emailSender');
const { generarReciboPDF } = require('../services/generadorRecibos');

exports.createOrder = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas
    const userEmail = req.userEmail;

    const { metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, pais, cupon, datos_pago } = req.body;

    if (!metodo_pago || !nombre_envio || !direccion_envio || !ciudad || !codigo_postal || !telefono || !pais) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    
    if (!['mexico', 'usa', 'españa'].includes(pais.toLowerCase())) {
        return res.status(400).json({ message: "País no soportado. Los países soportados son: mexico, usa, españa" });
    }

    if (!['tarjeta', 'oxxo', 'transferencia'].includes(metodo_pago.toLowerCase())) {
        return res.status(400).json({ message: "Método de pago no soportado. Los métodos soportados son: tarjeta, oxxo, transferencia" });
    }

    if (metodo_pago === 'tarjeta' && !datos_pago) {
        return res.status(400).json({ message: "Datos de pago son obligatorios para el método tarjeta" });
    }

    let subtotal = 0;
    let impuesto = 0;
    let gasto_envio = 0;
    let total = 0;
    let text = '';

    try {
        // Calcular el subtotal del carrito
        const [cartItems] = await pool.query(
            'SELECT ci.producto_id, ci.cantidad, p.precio, p.descuento, p.hasDescuento FROM carrito_items ci JOIN productos p ON ci.producto_id = p.id WHERE ci.usuario_id = ?',
            [userId]
        );

        for (const item of cartItems) {
            let precioUnitario = item.precio;
            if (item.hasDescuento) {
                precioUnitario = precioUnitario - (precioUnitario * item.descuento);
            }
            subtotal += precioUnitario * item.cantidad;
        }

        if (pais === 'mexico') {
            impuesto = subtotal * 0.16;
            gasto_envio = 120;
        }else if (pais === 'usa') {
            impuesto = subtotal * 0.07;
            gasto_envio = 180;
        }else if (pais === 'españa') {
            impuesto = subtotal * 0.21;
            gasto_envio = 150;
        }

        total = subtotal + impuesto + gasto_envio;

        if (cupon) {
            if (cupon === 'DESCUENTO10') {
                total = total * 0.9;
            }
        }

        // Insertar la orden
        const [orderResult] = await pool.query(
            'INSERT INTO ordenes (usuario_id, total, subtotal, impuestos, gasto_envio, metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, cupon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, total, subtotal, impuesto, gasto_envio, metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, cupon]
        );
        const orderId = orderResult.insertId;

        // Insertar los ítems de la orden y actualizar el stock
        for (const item of cartItems) {
            let precioUnitario = item.precio;
            if (item.hasDescuento) {
                precioUnitario = precioUnitario - (precioUnitario * item.descuento);
            }

            // Obtener la categoría del producto
            const [productoInfo] = await pool.query('SELECT nombre, categoria FROM productos WHERE id = ?', [item.producto_id]);
            const categoria = productoInfo[0].categoria;

            await pool.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
            await pool.query(
                'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario, categoria) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.producto_id, item.cantidad, precioUnitario, categoria]
            );

            text += `<li><strong>${item.cantidad}x</strong> ${productoInfo[0].nombre} - <strong>$${precioUnitario}</strong></li>`;
        }
        // Vaciar el carrito
        await pool.query(
            'DELETE FROM carrito_items WHERE usuario_id = ?',
            [userId]
        );

        const pdfPath = await generarReciboPDF({
            orderId,
            userId,
            cartItems,
            subtotal,
            impuesto,
            gasto_envio,
            total,
            cupon,
            nombre_envio,
            direccion_envio,
            ciudad,
            codigo_postal,
            pais,
            telefono
        });

        await sendMailWithPdf({
            to: userEmail,
            subject: 'Confirmación de tu orden en KICKS',
            pdfPath: pdfPath,
            pdfName: `Recibo_Orden_${orderId}.pdf`
        });

        res.status(201).json({ message: "Orden creada exitosamente", orderId });
    } catch (error) {
        console.error("Error al crear la orden:", error);
        res.status(500).json({ message: "Error al crear la orden" });
    }
}

exports.getPaises = async (_req, res) => {
    const paises = [
        { nombre: "México", codigo: "mexico", impuesto: 0.16, gasto_envio: 120 },
        { nombre: "Estados Unidos", codigo: "usa", impuesto: 0.07, gasto_envio: 180 },
        { nombre: "España", codigo: "españa", impuesto: 0.21, gasto_envio: 150 }
    ];
    res.json(paises);
}

exports.infoTransferencia = async (_req, res) => {
    const info = {
        banco: "STP",
        clabe: "012345678901234567",
        titular: "Kicks Tienda",
        referencia: Math.floor(100000 + Math.random() * 900000),    
    };
    res.json(info);
}

exports.getOxxoDetails = async (_req, res) => {
    const details = {
        referencia: Math.floor(100000000 + Math.random() * 900000000),
    };
    res.json(details);
}

exports.getVentas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT SUM(subtotal) AS total_ventas FROM ordenes');
        const totalVentas = rows[0].total_ventas;
        res.json({ totalVentas });
    } catch (error) {
        console.error("Error al obtener las ventas totales:", error);
        res.status(500).json({ message: "Error al obtener las ventas totales" });
    }
}

exports.getVentasPorCategoria = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT categoria, SUM(precio_unitario * cantidad) AS total_ventas FROM orden_items GROUP BY categoria`);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener las ventas por categoría:", error);
        res.status(500).json({ message: "Error al obtener las ventas por categoría" });
    }
}

