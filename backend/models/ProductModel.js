const { pool } = require('../services/dbConnection');

const getProductInfo = async (productId) => {
    try {
        const [productRows] = await pool.query(
            'SELECT nombre, precio, stock FROM productos WHERE id = ? AND estado = 1',
            [productId]
        );
        return productRows.length > 0 ? productRows[0] : null;
    } catch (error) {
        console.error("Error en ProductModel.getProductInfo:", error);
        throw error;
    }
};

const getProductFirstImage = async (productId) => {
    try {
        const [imagenes] = await pool.query(
            'SELECT url FROM producto_imagenes WHERE producto_id = ? LIMIT 1',
            [productId]
        );
        return imagenes.length > 0 ? imagenes[0].url : null;
    } catch (error) {
        console.error("Error en ProductModel.getProductFirstImage:", error);
        throw error;
    }
};

const getProductStock = async (productId) => {
    try {
        const [products] = await pool.query(
            'SELECT stock FROM productos WHERE id = ? AND estado = 1',
            [productId]
        );
        return products.length > 0 ? products[0] : null;
    } catch (error) {
        console.error("Error en ProductModel.getProductStock:", error);
        throw error;
    }
};

const getAllProducts = async (categoria, hasDescuento) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM productos WHERE estado = 1` +
            (categoria ? ` AND categoria = ?` : '') +
            (hasDescuento ? ` AND hasDescuento = ?` : ''), [categoria, hasDescuento].filter(Boolean));
        return rows;
    } catch (error) {
        console.error("Error en ProductModel.getAllProducts:", error);
        throw error;
    }
};

const getProductById = async (productId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE estado = 1 AND id = ?', [productId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error en ProductModel.getProductById:", error);
        throw error;
    }
};

const getProductImages = async (productId) => {
    try {
        const [imagenes] = await pool.query(
            'SELECT id, url as url_imagen FROM producto_imagenes WHERE producto_id = ?',
            [productId]
        );
        return imagenes;
    } catch (error) {
        console.error("Error en ProductModel.getProductImages:", error);
        throw error;
    }
};

const createProduct = async (connection, { nombre, descripcion, precio, stock, categoria, descuento, marca }) => {
    try {
        const [result] = await connection.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, descuento, hasDescuento, marca) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria, descuento, descuento > 0 ? 1 : 0, marca]
        );
        return result;
    } catch (error) {
        console.error("Error en ProductModel.createProduct:", error);
        throw error;
    }
};

const addProductImages = async (connection, productId, imagenesValues) => {
    try {
        const [result] = await connection.query(
            'INSERT INTO producto_imagenes (producto_id, url) VALUES ?',
            [imagenesValues]
        );
        return result;
    } catch (error) {
        console.error("Error en ProductModel.addProductImages:", error);
        throw error;
    }
};

const updateProduct = async ({ id, nombre, descripcion, precio, stock, categoria, descuento, marca }) => {
    try {
        const [result] = await pool.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, descuento = ?, hasDescuento = ?, marca = ? WHERE id = ? AND estado = 1',
            [nombre, descripcion, precio, stock, categoria, descuento, descuento > 0 ? 1 : 0, marca, id]
        );
        return result;
    } catch (error) {
        console.error("Error en ProductModel.updateProduct:", error);
        throw error;
    }
};

const deleteProduct = async (productId) => {
    try {
        const [result] = await pool.query(
            'UPDATE productos SET estado = 0 WHERE id = ?',
            [productId]
        );
        return result;
    } catch (error) {
        console.error("Error en ProductModel.deleteProduct:", error);
        throw error;
    }
};

const getRandomProducts = async (limit = 4) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE estado = 1 ORDER BY RAND() LIMIT ?', [limit]);
        return rows;
    } catch (error) {
        console.error("Error en ProductModel.getRandomProducts:", error);
        throw error;
    }
};

const checkProductExists = async (productId) => {
    try {
        const [producto] = await pool.query('SELECT id FROM productos WHERE id = ? AND estado = 1', [productId]);
        return producto.length > 0;
    } catch (error) {
        console.error("Error en ProductModel.checkProductExists:", error);
        throw error;
    }
};

const getImageById = async (imageId, productId) => {
    try {
        const [imagen] = await pool.query(
            'SELECT id, url FROM producto_imagenes WHERE id = ? AND producto_id = ?',
            [imageId, productId]
        );
        return imagen.length > 0 ? imagen[0] : null;
    } catch (error) {
        console.error("Error en ProductModel.getImageById:", error);
        throw error;
    }
};

const deleteProductImage = async (imageId) => {
    try {
        const [result] = await pool.query('DELETE FROM producto_imagenes WHERE id = ?', [imageId]);
        return result;
    } catch (error) {
        console.error("Error en ProductModel.deleteProductImage:", error);
        throw error;
    }
};

const getStockByCategory = async (categoria) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, stock, nombre FROM productos WHERE categoria = ? AND estado = 1',
            [categoria]
        );
        return rows;
    } catch (error) {
        console.error("Error en ProductModel.getStockByCategory:", error);
        throw error;
    }
};

module.exports = {
    getProductInfo,
    getProductFirstImage,
    getProductStock,
    getAllProducts,
    getProductById,
    getProductImages,
    createProduct,
    addProductImages,
    updateProduct,
    deleteProduct,
    getRandomProducts,
    checkProductExists,
    getImageById,
    deleteProductImage,
    getStockByCategory
};
