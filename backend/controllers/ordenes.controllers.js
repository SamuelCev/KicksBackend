const { pool } = require('../services/dbConnection');
const { sendMailWithPdf } = require('../services/emailSender');
const { generarReciboPDF } = require('../services/generadorRecibos');
const OrderModel = require('../models/OrderModel');

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

    try {
        // Calcular el subtotal del carrito
        const cartItems = await OrderModel.getCartItemsWithPrices(userId);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío" });
        }

        for (const item of cartItems) {
            let precioUnitario = parseFloat(item.precio);
            if (item.hasDescuento) {
                precioUnitario = precioUnitario - (precioUnitario * item.descuento);
            }
            subtotal += precioUnitario * item.cantidad;
        }

        if (pais === 'mexico') {
            impuesto = subtotal * 0.16;
            gasto_envio = 120;
        } else if (pais === 'usa') {
            impuesto = subtotal * 0.07;
            gasto_envio = 180;
        } else if (pais === 'españa') {
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
        const orderResult = await OrderModel.createOrder({
            userId,
            total,
            subtotal,
            impuesto,
            gasto_envio,
            metodo_pago,
            nombre_envio,
            direccion_envio,
            ciudad,
            codigo_postal,
            telefono,
            cupon
        });
        const orderId = orderResult.insertId;

        // Preparar artículos para el PDF
        const articulosParaPDF = [];

        // Insertar los ítems de la orden y actualizar el stock
        for (const item of cartItems) {
            let precioUnitario = item.precio;
            if (item.hasDescuento) {
                precioUnitario = precioUnitario - (precioUnitario * item.descuento);
            }

            // Obtener la categoría del producto
            const productoInfo = await OrderModel.getProductInfo(item.producto_id);
            const categoria = productoInfo.categoria;

            await OrderModel.updateProductStock(item.producto_id, item.cantidad);
            await OrderModel.createOrderItem({
                orderId,
                productId: item.producto_id,
                cantidad: item.cantidad,
                precioUnitario,
                categoria
            });

            // Agregar al array para el PDF
            articulosParaPDF.push({
                nombre: productoInfo.nombre,
                cantidad: parseInt(item.cantidad),
                precioUnitario: parseFloat(precioUnitario)
            });
        }

        const pdfPath = await generarReciboPDF({
            fecha: new Date(),
            nombreCliente: nombre_envio,
            articulos: articulosParaPDF,
            subtotal: subtotal,
            impuestos: impuesto,
            gastosEnvio: gasto_envio,
            nombreCupon: cupon || null,
            porcentajeDescuento: cupon === 'DESCUENTO10' ? 10 : 0,
            total: total
        });

        // Enviar email con PDF
        await sendMailWithPdf({
            to: userEmail,
            subject: 'Confirmación de tu orden en KICKS',
            pdfPath: pdfPath,
            pdfName: `Recibo_Orden_${orderId}.pdf`
        });

        await OrderModel.clearUserCart(userId);

        res.status(201).json({ 
            ok: true,
            message: "Orden creada exitosamente", 
            orderId 
        });
    } catch (error) {
        console.error("Error al crear la orden:", error);
        res.status(500).json({ 
            ok: false,
            message: "Error al crear la orden",
            error: error.message 
        });
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
        const totalVentas = await OrderModel.getTotalVentas();
        res.json({ totalVentas });
    } catch (error) {
        console.error("Error al obtener las ventas totales:", error);
        res.status(500).json({ message: "Error al obtener las ventas totales" });
    }
}

exports.getVentasPorCategoria = async (req, res) => {
    try {
        const rows = await OrderModel.getVentasPorCategoria();
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener las ventas por categoría:", error);
        res.status(500).json({ message: "Error al obtener las ventas por categoría" });
    }
}

exports.validarCupon = async (req, res) => {
    const { cupon } = req.body;

    if (!cupon) {
        return res.status(400).json({ message: "El código de cupón es obligatorio" });
    }

    try {
        let descuento = 0;
        if (cupon === 'DESCUENTO10') {
            descuento = 0.10;
        } else {
            return res.status(404).json({ message: "Cupón no válido" });
        }
        res.json({ cupon, descuento });
    } catch (error) {
        console.error("Error al validar el cupón:", error);
        res.status(500).json({ message: "Error al validar el cupón" });
    }
}