import { API_URL } from './config.js';

// URL base del backend para las imágenes
const BACKEND_URL = 'http://localhost:3000';

/**
 * Obtener URL completa de la imagen
 * @param {string} imagenPath - Ruta de la imagen (/uploads/...)
 * @returns {string} - URL completa de la imagen
 */
export function obtenerUrlImagen(imagenPath) {
    if (!imagenPath) return null;
    return `${BACKEND_URL}${imagenPath}`;
}

/**
 * Obtener productos aleatorios (para homepage)
 * @returns {Promise<Array>} - Array de productos aleatorios (máximo 4)
 */
export async function obtenerProductosAleatorios() {
    try {
        const response = await fetch(`${API_URL}/products/randoms`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Agregar URL completa a las imágenes
        return data.map(producto => ({
            ...producto,
            imagenCompleta: obtenerUrlImagen(producto.imagen)
        }));
    } catch (error) {
        console.error('Error al obtener productos aleatorios:', error);
        throw error;
    }
}

/**
 * Obtener todos los productos con filtros opcionales
 * @param {Object} filtros - Objeto con filtros (categoria, hasDescuento)
 * @returns {Promise<Array>} - Array de productos
 */
export async function obtenerProductos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.hasDescuento !== undefined) params.append('hasDescuento', filtros.hasDescuento ? '1' : '0');
        
        const url = `${API_URL}/products${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Agregar URL completa a las imágenes
        return data.map(producto => ({
            ...producto,
            imagenCompleta: obtenerUrlImagen(producto.imagen)
        }));
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw error;
    }
}

/**
 * Obtener un producto por su ID
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} - Objeto del producto con todas sus imágenes
 */
export async function obtenerProductoPorId(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Producto no encontrado');
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Agregar URLs completas a todas las imágenes
        if (data.imagenes && Array.isArray(data.imagenes)) {
            data.imagenesCompletas = data.imagenes.map(img => ({
                id: img.id,
                url: obtenerUrlImagen(img.url)
            }));
        }
        return data;
    } catch (error) {
        console.error('Error al obtener producto:', error);
        throw error;
    }
}

/**
 * Obtener categorías disponibles
 * @returns {Promise<Array>} - Array de categorías
 */
export async function obtenerCategorias() {
    try {
        const response = await fetch(`${API_URL}/productos/categorias`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    }
}
