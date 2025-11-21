const { pool } = require('../services/dbConnection');

const getCartItemsByUserId = async (userId) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM carrito_items WHERE usuario_id = ?',
            [userId]
        );
        return rows;
    } catch (error) {
        console.error("Error en CartModel.getCartItemsByUserId:", error);
        throw error;
    }
};

const getItemByProductId = async (userId, productId) => {
    try {
        const [items] = await pool.query(
            'SELECT * FROM carrito_items WHERE usuario_id = ? AND producto_id = ?',
            [userId, productId]
        );
        return items.length > 0 ? items[0] : null;
    } catch (error) {
        console.error("Error en CartModel.getItemByProductId:", error);
        throw error;
    }
};

const addItem = async (userId, productId, cantidad) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO carrito_items (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
            [userId, productId, cantidad]
        );
        return result;
    } catch (error) {
        console.error("Error en CartModel.addItem:", error);
        throw error;
    }
};

const incrementItemQuantity = async (itemId, cantidad) => {
    try {
        const [result] = await pool.query(
            'UPDATE carrito_items SET cantidad = cantidad + ? WHERE id = ?',
            [cantidad, itemId]
        );
        return result;
    } catch (error) {
        console.error("Error en CartModel.incrementItemQuantity:", error);
        throw error;
    }
};

const removeItem = async (itemId, userId) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM carrito_items WHERE id = ? AND usuario_id = ?',
            [itemId, userId]
        );
        return result;
    } catch (error) {
        console.error("Error en CartModel.removeItem:", error);
        throw error;
    }
};

const getItemById = async (itemId, userId) => {
    try {
        const [items] = await pool.query(
            'SELECT producto_id FROM carrito_items WHERE id = ? AND usuario_id = ?',
            [itemId, userId]
        );
        return items.length > 0 ? items[0] : null;
    } catch (error) {
        console.error("Error en CartModel.getItemById:", error);
        throw error;
    }
};

const updateItemQuantity = async (itemId, userId, cantidad) => {
    try {
        const [result] = await pool.query(
            'UPDATE carrito_items SET cantidad = ? WHERE id = ? AND usuario_id = ?',
            [cantidad, itemId, userId]
        );
        return result;
    } catch (error) {
        console.error("Error en CartModel.updateItemQuantity:", error);
        throw error;
    }
};

const getCartItemCount = async (userId) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM carrito_items WHERE usuario_id = ?',
            [userId]
        );
        return result[0].count;
    } catch (error) {
        console.error("Error en CartModel.getCartItemCount:", error);
        throw error;
    }
};

module.exports = {
    getCartItemsByUserId,
    addItem,
    removeItem,
    getItemById,
    updateItemQuantity,
    getItemByProductId,
    incrementItemQuantity,
    getCartItemCount
};
