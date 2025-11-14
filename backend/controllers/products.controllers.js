const { pool } = require('../services/dbConnection');

exports.getAllProducts = async (req, res) => {
    const { categoria, hasDescuento } = req.query;

    try {
        const [rows] = await pool.query(`SELECT * FROM productos WHERE estado = 1` +
            (categoria ? ` AND categoria = ?` : '') +
            (hasDescuento ? ` AND hasDescuento = ?` : ''), [categoria, hasDescuento].filter(Boolean));
        
        // Obtener la primera imagen para cada producto
        const productosConImagen = await Promise.all(rows.map(async (producto) => {
            const [imagenes] = await pool.query(
                'SELECT url FROM producto_imagenes WHERE producto_id = ? LIMIT 1',
                [producto.id]
            );
            return {
                ...producto,
                imagen: imagenes.length > 0 ? imagenes[0].url : null
            };
        }));
        
        res.json(productosConImagen);
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
        
        // Obtener todas las imágenes del producto
        const [imagenes] = await pool.query(
            'SELECT id, url as url_imagen FROM producto_imagenes WHERE producto_id = ?',
            [id]
        );
        
        const producto = {
            ...rows[0],
            imagenes: imagenes
        };
        
        res.json(producto);
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
}

exports.createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, descuento } = req.body;
    
    // Validación de campos
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

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Crear el producto
        const [result] = await connection.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, descuento, hasDescuento) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria, descuento, descuento > 0 ? 1 : 0]
        );
        
        const productoId = result.insertId;
        
        // Guardar las imágenes si se subieron
        if (req.files && req.files.length > 0) {
            const imagenesValues = req.files.map(file => [productoId, `/uploads/${file.filename}`]);
            await connection.query(
                'INSERT INTO producto_imagenes (producto_id, url) VALUES ?',
                [imagenesValues]
            );
        }
        
        await connection.commit();
        
        // Obtener las imágenes guardadas
        const [imagenes] = await connection.query(
            'SELECT id, url FROM producto_imagenes WHERE producto_id = ?',
            [productoId]
        );
        
        res.status(201).json({ 
            id: productoId, 
            nombre, 
            descripcion, 
            precio, 
            stock, 
            categoria, 
            descuento,
            imagenes 
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error al crear el producto:", error);
        res.status(500).json({ message: "Error al crear el producto" });
    } finally {
        connection.release();
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
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, descuento = ?, hasDescuento = ? WHERE id = ? AND estado = 1',
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
        
        // Obtener la primera imagen para cada producto
        const productosConImagen = await Promise.all(rows.map(async (producto) => {
            const [imagenes] = await pool.query(
                'SELECT url FROM producto_imagenes WHERE producto_id = ? LIMIT 1',
                [producto.id]
            );
            return {
                ...producto,
                imagen: imagenes.length > 0 ? imagenes[0].url : null
            };
        }));
        
        res.json(productosConImagen);
    } catch (error) {
        console.error("Error al obtener productos aleatorios:", error);
        res.status(500).json({ message: "Error al obtener productos aleatorios" });
    }
}

// Agregar imágenes a un producto existente
exports.addProductImages = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el producto existe
        const [producto] = await pool.query('SELECT id FROM productos WHERE id = ? AND estado = 1', [id]);
        if (producto.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar que se subieron archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No se enviaron imágenes" });
        }

        // Guardar las imágenes
        const imagenesValues = req.files.map(file => [id, `/uploads/${file.filename}`]);
        await pool.query(
            'INSERT INTO producto_imagenes (producto_id, url) VALUES ?',
            [imagenesValues]
        );

        // Obtener todas las imágenes del producto
        const [imagenes] = await pool.query(
            'SELECT id, url FROM producto_imagenes WHERE producto_id = ?',
            [id]
        );

        res.status(201).json({ 
            message: "Imágenes agregadas exitosamente",
            imagenes 
        });
    } catch (error) {
        console.error("Error al agregar imágenes:", error);
        res.status(500).json({ message: "Error al agregar imágenes" });
    }
}

// Eliminar una imagen específica
exports.deleteProductImage = async (req, res) => {
    const { id, imageId } = req.params;

    try {
        // Verificar que la imagen existe y pertenece al producto
        const [imagen] = await pool.query(
            'SELECT id, url FROM producto_imagenes WHERE id = ? AND producto_id = ?',
            [imageId, id]
        );

        if (imagen.length === 0) {
            return res.status(404).json({ message: "Imagen no encontrada o no pertenece a este producto" });
        }

        // Eliminar la imagen de la base de datos
        await pool.query('DELETE FROM producto_imagenes WHERE id = ?', [imageId]);

        // Opcional: Eliminar el archivo físico del servidor
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', imagen[0].url);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: "Imagen eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar imagen:", error);
        res.status(500).json({ message: "Error al eliminar imagen" });
    }
}

exports.getStockByCategory = async (req, res) => {
    const { categoria } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT id, stock, nombre FROM productos WHERE categoria = ? AND estado = 1',
            [categoria]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener el stock por categoría:", error);
        res.status(500).json({ message: "Error al obtener el stock por categoría" });
    }
}