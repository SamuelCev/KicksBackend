import { API_URL } from './config.js';

/**
 * Obtener configuración de SweetAlert según el tema actual
 */
function getSwalConfig() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        background: isDark ? '#1a1a1a' : '#ffffff',
        color: isDark ? '#e0e0e0' : '#333333',
        confirmButtonColor: isDark ? '#4a9eff' : '#007bff',
        cancelButtonColor: isDark ? '#6c757d' : '#6c757d',
        iconColor: isDark ? '#4a9eff' : '#007bff'
    };
}

/**
 * Mostrar alerta de éxito al agregar al carrito
 */
function mostrarAlertaCarrito(productName) {
    Swal.fire({
        icon: 'success',
        title: '¡Agregado al carrito!',
        text: `"${productName}" se agregó correctamente`,
        ...getSwalConfig(),
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
    });
}

/**
 * Mostrar alerta de error
 */
function mostrarAlertaError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        ...getSwalConfig(),
        confirmButtonText: 'Entendido'
    });
}

/**
 * Obtener carrito del usuario
 * @returns {Promise<Array>} - Array de items del carrito
 */
export async function obtenerCarrito() {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            credentials: 'include' // Incluir cookies para autenticación
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener el carrito');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        throw error;
    }
}

/**
 * Agregar producto al carrito
 * @param {number} productId - ID del producto
 * @param {number} cantidad - Cantidad a agregar
 * @param {string} productName - Nombre del producto (para la notificación)
 * @returns {Promise<Object>} - Item agregado al carrito
 */
export async function agregarAlCarrito(productId, cantidad = 1, productName = '') {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Incluir cookies para autenticación
            body: JSON.stringify({
                productId: parseInt(productId),
                cantidad: parseInt(cantidad)
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al agregar al carrito');
        }
        
        const data = await response.json();
        
        // Mostrar notificación de éxito
        mostrarAlertaCarrito(productName);
        
        // Disparar evento personalizado para actualizar UI
        const event = new CustomEvent('cart-updated', {
            detail: { action: 'add', productId, cantidad }
        });
        window.dispatchEvent(event);
        
        return data;
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarAlertaError(error.message || 'No se pudo agregar el producto al carrito');
        throw error;
    }
}

/**
 * Eliminar producto del carrito
 * @param {number} itemId - ID del item en el carrito
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function eliminarDelCarrito(itemId) {
    try {
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar del carrito');
        }
        
        const data = await response.json();
        
        // Disparar evento personalizado para actualizar UI
        const event = new CustomEvent('cart-updated', {
            detail: { action: 'remove', itemId }
        });
        window.dispatchEvent(event);
        
        return data;
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        mostrarAlertaError(error.message || 'No se pudo eliminar el producto del carrito');
        throw error;
    }
}

/**
 * Actualizar cantidad de un item en el carrito
 * @param {number} itemId - ID del item en el carrito
 * @param {number} cantidad - Nueva cantidad
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function actualizarCantidad(itemId, cantidad) {
    try {
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ cantidad: parseInt(cantidad) })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar cantidad');
        }
        
        const data = await response.json();
        
        // Disparar evento personalizado para actualizar UI
        const event = new CustomEvent('cart-updated', {
            detail: { action: 'update', itemId, cantidad }
        });
        window.dispatchEvent(event);
        
        return data;
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        mostrarAlertaError(error.message || 'No se pudo actualizar la cantidad');
        throw error;
    }
}
