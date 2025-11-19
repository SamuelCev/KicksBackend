const { pool } = require('../services/dbConnection');
const ProductModel = require('../models/ProductModel');

exports.getAllProducts = async (req, res) => {
    const { categoria, hasDescuento } = req.query;

    try {
        const rows = await ProductModel.getAllProducts(categoria, hasDescuento);
        
        // Obtener la primera imagen para cada producto
        const productosConImagen = await Promise.all(rows.map(async (producto) => {
            const imagen = await ProductModel.getProductFirstImage(producto.id);
            return {
                ...producto,
                imagen
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
        const producto = await ProductModel.getProductById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        // Obtener todas las imágenes del producto
        const imagenes = await ProductModel.getProductImages(id);
        
        const productoCompleto = {
            ...producto,
            imagenes
        };
        
        res.json(productoCompleto);
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
}

exports.createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, descuento, marca } = req.body;
    
    // Validación de campos
    if (
        nombre === undefined ||
        descripcion === undefined ||
        precio === undefined ||
        stock === undefined ||
        categoria === undefined ||
        descuento === undefined ||
        marca === undefined
    ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios: nombre, descripcion, precio, stock, categoria, descuento, marca" });
    }

    if (categoria !== 'senderismo' && categoria !== 'basketball' && categoria !== 'running') {
        return res.status(400).json({ message: "Categoría inválida. Las categorías permitidas son: senderismo, basketball, running" });
    }

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Crear el producto
        const result = await ProductModel.createProduct(connection, { nombre, descripcion, precio, stock, categoria, descuento, marca });
        
        const productoId = result.insertId;
        
        // Guardar las imágenes si se subieron
        if (req.files && req.files.length > 0) {
            const imagenesValues = req.files.map(file => [productoId, `/uploads/${file.filename}`]);
            await ProductModel.addProductImages(connection, productoId, imagenesValues);
        }
        
        await connection.commit();
        
        // Obtener las imágenes guardadas
        const imagenes = await ProductModel.getProductImages(productoId);
        
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
    const { nombre, descripcion, precio, stock, categoria, descuento, marca } = req.body;

    if (
        nombre === undefined ||
        descripcion === undefined ||
        precio === undefined ||
        stock === undefined ||
        categoria === undefined ||
        descuento === undefined ||
        marca === undefined
    ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios: nombre, descripcion, precio, stock, categoria, descuento, marca" });
    }

    if (categoria !== 'senderismo' && categoria !== 'basketball' && categoria !== 'running') {
        return res.status(400).json({ message: "Categoría inválida. Las categorías permitidas son: senderismo, basketball, running" });
    }

    try {
        const result = await ProductModel.updateProduct({ id, nombre, descripcion, precio, stock, categoria, descuento, marca });

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
        const result = await ProductModel.deleteProduct(id);
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
        const rows = await ProductModel.getRandomProducts(4);
        
        // Obtener la primera imagen para cada producto
        const productosConImagen = await Promise.all(rows.map(async (producto) => {
            const imagen = await ProductModel.getProductFirstImage(producto.id);
            return {
                ...producto,
                imagen
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
        const productoExiste = await ProductModel.checkProductExists(id);
        if (!productoExiste) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar que se subieron archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No se enviaron imágenes" });
        }

        // Guardar las imágenes
        const imagenesValues = req.files.map(file => [id, `/uploads/${file.filename}`]);
        const connection = await pool.getConnection();
        await ProductModel.addProductImages(connection, id, imagenesValues);
        connection.release();

        // Obtener todas las imágenes del producto
        const imagenes = await ProductModel.getProductImages(id);

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
        const imagen = await ProductModel.getImageById(imageId, id);

        if (!imagen) {
            return res.status(404).json({ message: "Imagen no encontrada o no pertenece a este producto" });
        }

        // Eliminar la imagen de la base de datos
        await ProductModel.deleteProductImage(imageId);

        // Opcional: Eliminar el archivo físico del servidor
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', imagen.url);
        
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
        const rows = await ProductModel.getStockByCategory(categoria);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener el stock por categoría:", error);
        res.status(500).json({ message: "Error al obtener el stock por categoría" });
    }
}