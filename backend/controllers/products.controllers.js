const pool = require('../services/dbConnection');

exports.getAllProducts = async (req, res) => {
    const { categoria, hasDescuento } = req.query;

    try {
        const [rows] = await pool.query(`SELECT * FROM productos WHERE estado = 1` +
            (categoria ? ` AND categoria = ?` : '') +
            (hasDescuento ? ` AND hasDescuento = ?` : ''), [categoria, hasDescuento].filter(Boolean));
        
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
}

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE estado = 1 AND id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
}

exports.createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, descuento } = req.body;
    if (
        nombre === undefined ||
        descripcion === undefined ||
        precio === undefined ||
        stock === undefined ||
        categoria === undefined ||
        descuento === undefined
    ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios: nombre, descripcion, precio, stock, categoria, descuento" });
    }

    if (categoria !== 'senderismo' && categoria !== 'basketball' && categoria !== 'running') {
        return res.status(400).json({ message: "Categoría inválida. Las categorías permitidas son: senderismo, basketball, running" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, descuento, hasDescuento) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria, descuento, descuento > 0 ? 1 : 0]
        );
        res.status(201).json({ id: result.insertId, nombre, descripcion, precio, stock, categoria, descuento });
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).json({ message: "Error al crear el producto" });
    }
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, descuento } = req.body;

    if (
        nombre === undefined ||
        descripcion === undefined ||
        precio === undefined ||
        stock === undefined ||
        categoria === undefined ||
        descuento === undefined
    ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios: nombre, descripcion, precio, stock, categoria, descuento" });
    }

    if (categoria !== 'senderismo' && categoria !== 'basketball' && categoria !== 'running') {
        return res.status(400).json({ message: "Categoría inválida. Las categorías permitidas son: senderismo, basketball, running" });
    }

    try {
        const [result] = await pool.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, descuento = ?, hasDescuento = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, categoria, descuento, descuento > 0 ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ id, nombre, descripcion, precio, stock, categoria, descuento });
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
}

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE productos SET estado = 0 WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
}

exports.productosAleatorios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE estado = 1 ORDER BY RAND() LIMIT 4');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener productos aleatorios:", error);
        res.status(500).json({ message: "Error al obtener productos aleatorios" });
    }
}