const { pool } = require('../services/dbConnection');

const searchProducts = async ({ query, categoria, precioMin, precioMax }) => {
    try {
        let sql = `
            SELECT 
                id, 
                nombre, 
                marca, 
                descripcion, 
                precio, 
                stock, 
                categoria, 
                descuento,
                hasDescuento,
                imagen,
                CASE 
                    WHEN hasDescuento = 1 THEN precio * (1 - descuento)
                    ELSE precio
                END as precio_final
            FROM productos 
            WHERE estado = 1
        `;
        const sqlParams = [];
        
        if (query) {
            sql += ' AND (nombre LIKE ? OR marca LIKE ? OR descripcion LIKE ?)';
            sqlParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
        }
        
        if (categoria) {
            sql += ' AND categoria = ?';
            sqlParams.push(categoria);
        }
        
        if (precioMin !== undefined) {
            sql += ' AND precio >= ?';
            sqlParams.push(precioMin);
        }
        
        if (precioMax !== undefined) {
            sql += ' AND precio <= ?';
            sqlParams.push(precioMax);
        }
        
        sql += ' ORDER BY nombre LIMIT 10';
        
        const [productos] = await pool.query(sql, sqlParams);
        return productos;
    } catch (error) {
        console.error("Error en AIModel.searchProducts:", error);
        throw error;
    }
};

const getCategories = async () => {
    try {
        const [categorias] = await pool.query(
            `SELECT DISTINCT categoria
             FROM productos
             WHERE categoria IS NOT NULL AND estado = 1
             ORDER BY categoria`
        );
        return categorias.map(c => c.categoria);
    } catch (error) {
        console.error("Error en AIModel.getCategories:", error);
        throw error;
    }
};

const getBrands = async () => {
    try {
        const [marcas] = await pool.query(
            `SELECT DISTINCT marca
             FROM productos
             WHERE marca IS NOT NULL AND estado = 1
             ORDER BY marca`
        );
        return marcas.map(m => m.marca);
    } catch (error) {
        console.error("Error en AIModel.getBrands:", error);
        throw error;
    }
};

const getProductById = async (productId) => {
    try {
        const [producto] = await pool.query(
            `SELECT
                p.*,
                CASE
                    WHEN p.hasDescuento = 1 THEN p.precio * (1 - p.descuento)
                    ELSE p.precio
                END as precio_final
            FROM productos p
            WHERE p.id = ? AND p.estado = 1`,
            [productId]
        );
        return producto.length > 0 ? producto[0] : null;
    } catch (error) {
        console.error("Error en AIModel.getProductById:", error);
        throw error;
    }
};

const getProductImages = async (productId) => {
    try {
        const [imagenes] = await pool.query(
            'SELECT url FROM producto_imagenes WHERE producto_id = ?',
            [productId]
        );
        return imagenes.map(img => img.url);
    } catch (error) {
        console.error("Error en AIModel.getProductImages:", error);
        throw error;
    }
};

const getDiscountedProducts = async () => {
    try {
        const [productos] = await pool.query(
            `SELECT
                id,
                nombre,
                marca,
                precio,
                descuento,
                precio * (1 - descuento) as precio_final,
                stock,
                categoria,
                imagen
            FROM productos
            WHERE hasDescuento = 1 AND estado = 1
            ORDER BY descuento DESC
            LIMIT 10`
        );
        return productos;
    } catch (error) {
        console.error("Error en AIModel.getDiscountedProducts:", error);
        throw error;
    }
};

module.exports = {
    searchProducts,
    getCategories,
    getBrands,
    getProductById,
    getProductImages,
    getDiscountedProducts
};
