const { pool } = require('../services/dbConnection');

exports.getCartByUserId = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    try {
        const [rows] = await pool.query('SELECT * FROM carrito_items WHERE usuario_id = ?', [userId]);

        for (const row of rows) {
            const [productRows] =  await pool.query('SELECT nombre, precio FROM productos WHERE id = ?', [row.producto_id]);
            const [imagenes] = await pool.query(
                'SELECT url FROM producto_imagenes WHERE producto_id = ? LIMIT 1',
                [row.producto_id]
            );
            
            row.info_producto = {
                ...productRows[0],
                imagen: imagenes.length > 0 ? imagenes[0].url : null
            };
        }

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ message: "Error al obtener el carrito" });
    }
}

exports.addItemToCart = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    const { productId, cantidad } = req.body;
    
    if (productId === undefined || cantidad === undefined) {
        return res.status(400).json({ message: "Los campos productId y cantidad son obligatorios" });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO carrito_items (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)', [userId, productId, cantidad]
        );
        res.status(201).json({ id: result.insertId, userId, productId, cantidad });
    } catch (error) {
        console.error("Error al agregar el ítem al carrito:", error);
        res.status(500).json({ message: "Error al agregar el ítem al carrito" });
    }
}

exports.removeItemFromCart = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    const { itemId } = req.params;
    
    try {
        const [result] = await pool.query(
            'DELETE FROM carrito_items WHERE id = ? AND usuario_id = ?', [itemId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ítem no encontrado en el carrito" });
        }
        res.json({ message: "Ítem eliminado del carrito" });
    } catch (error) {
        console.error("Error al eliminar el ítem del carrito:", error);
        res.status(500).json({ message: "Error al eliminar el ítem del carrito" });
    }
}