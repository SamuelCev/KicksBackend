const { pool } = require('../services/dbConnection');

const getCartItemsWithPrices = async (userId) => {
    try {
        const [cartItems] = await pool.query(
            'SELECT ci.producto_id, ci.cantidad, p.precio, p.descuento, p.hasDescuento FROM carrito_items ci JOIN productos p ON ci.producto_id = p.id WHERE ci.usuario_id = ?',
            [userId]
        );
        return cartItems;
    } catch (error) {
        console.error("Error en OrderModel.getCartItemsWithPrices:", error);
        throw error;
    }
};

const createOrder = async ({ userId, total, subtotal, impuesto, gasto_envio, metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, cupon }) => {
    try {
        const [orderResult] = await pool.query(
            'INSERT INTO ordenes (usuario_id, total, subtotal, impuestos, gasto_envio, metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, cupon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, total, subtotal, impuesto, gasto_envio, metodo_pago, nombre_envio, direccion_envio, ciudad, codigo_postal, telefono, cupon]
        );
        return orderResult;
    } catch (error) {
        console.error("Error en OrderModel.createOrder:", error);
        throw error;
    }
};

const getProductInfo = async (productId) => {
    try {
        const [productoInfo] = await pool.query('SELECT nombre, categoria FROM productos WHERE id = ?', [productId]);
        return productoInfo.length > 0 ? productoInfo[0] : null;
    } catch (error) {
        console.error("Error en OrderModel.getProductInfo:", error);
        throw error;
    }
};

const updateProductStock = async (productId, cantidad) => {
    try {
        await pool.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, productId]);
    } catch (error) {
        console.error("Error en OrderModel.updateProductStock:", error);
        throw error;
    }
};

const createOrderItem = async ({ orderId, productId, cantidad, precioUnitario, categoria }) => {
    try {
        await pool.query(
            'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario, categoria) VALUES (?, ?, ?, ?, ?)',
            [orderId, productId, cantidad, precioUnitario, categoria]
        );
    } catch (error) {
        console.error("Error en OrderModel.createOrderItem:", error);
        throw error;
    }
};

const clearUserCart = async (userId) => {
    try {
        await pool.query(
            'DELETE FROM carrito_items WHERE usuario_id = ?',
            [userId]
        );
    } catch (error) {
        console.error("Error en OrderModel.clearUserCart:", error);
        throw error;
    }
};

const getTotalVentas = async () => {
    try {
        const [rows] = await pool.query('SELECT SUM(subtotal) AS total_ventas FROM ordenes');
        return rows[0].total_ventas;
    } catch (error) {
        console.error("Error en OrderModel.getTotalVentas:", error);
        throw error;
    }
};

const getVentasPorCategoria = async () => {
    try {
        const [rows] = await pool.query(`SELECT categoria, SUM(precio_unitario * cantidad) AS total_ventas FROM orden_items GROUP BY categoria`);
        return rows;
    } catch (error) {
        console.error("Error en OrderModel.getVentasPorCategoria:", error);
        throw error;
    }
};

module.exports = {
    getCartItemsWithPrices,
    createOrder,
    getProductInfo,
    updateProductStock,
    createOrderItem,
    clearUserCart,
    getTotalVentas,
    getVentasPorCategoria
};
