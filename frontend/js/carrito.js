import { obtenerCarrito, actualizarCantidad, eliminarDelCarrito } from './api/carrito.js';
import { cartIcon } from './utils/icons.js';

const BACKEND_URL = 'http://localhost:3000';
let carritoItems = [];

/**
 * Obtener URL completa de la imagen
 */
function obtenerUrlImagen(imagenPath) {
    if (!imagenPath) return null;
    return `${BACKEND_URL}${imagenPath}`;
}

/**
 * Obtener configuración de SweetAlert según el tema actual
 */
function getSwalConfig() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        background: isDark ? '#1a1a1a' : '#ffffff',
        color: isDark ? '#e0e0e0' : '#333333',
        confirmButtonColor: isDark ? '#4a9eff' : '#007bff',
        cancelButtonColor: isDark ? '#6c757d' : '#6c757d'
    };
}

/**
 * Cargar productos del carrito
 */
async function cargarCarrito() {
    const container = document.getElementById('cart-content');
    
    try {
        carritoItems = await obtenerCarrito();
        
        if (carritoItems.length === 0) {
            mostrarCarritoVacio();
        } else {
            renderizarCarrito();
        }
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        container.innerHTML = `
            <div class="loading">
                <p style="color: var(--color-acento);">Error al cargar el carrito</p>
                <button class="continue-shopping" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

/**
 * Mostrar mensaje de carrito vacío
 */
function mostrarCarritoVacio() {
    const container = document.getElementById('cart-content');
    container.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon" style="color: #d01110;">
                ${cartIcon}
            </div>
            <p class="empty-cart-text">Tu carrito está vacío</p>
            <a href="productos.html" class="continue-shopping">Continuar comprando</a>
        </div>
    `;
}

/**
 * Renderizar carrito con productos
 */
function renderizarCarrito() {
    const container = document.getElementById('cart-content');
    
    const itemsHTML = carritoItems.map(item => {
        const imagenUrl = obtenerUrlImagen(item.info_producto.imagen) || 'https://via.placeholder.com/100';
        const precio = parseFloat(item.info_producto.precio);
        const stock = item.info_producto.stock || 0;
        const subtotal = precio * item.cantidad;
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${imagenUrl}" alt="${item.info_producto.nombre}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.info_producto.nombre}</h3>
                    <p class="cart-item-price">$${precio.toFixed(2)}</p>
                    <p class="cart-item-stock">Stock disponible: ${stock}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="decrementarCantidad(${item.id}, ${item.cantidad})" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity-value">${item.cantidad}</span>
                        <button class="quantity-btn" onclick="incrementarCantidad(${item.id}, ${item.cantidad}, ${stock})" ${item.cantidad >= stock ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="remove-btn" onclick="eliminarItem(${item.id}, '${item.info_producto.nombre}')">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
    
    const total = calcularTotal();
    const subtotalGeneral = total;
    const envio = total > 50 ? 0 : 5.99;
    const totalFinal = subtotalGeneral + envio;
    
    container.innerHTML = `
        <div class="cart-items">
            ${itemsHTML}
        </div>
        <div class="cart-summary">
            <h2 class="summary-title">Resumen del pedido</h2>
            <div class="summary-row">
                <span>Subtotal (${carritoItems.length} ${carritoItems.length === 1 ? 'producto' : 'productos'})</span>
                <span>$${subtotalGeneral.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Envío</span>
                <span>${envio === 0 ? 'GRATIS' : '$' + envio.toFixed(2)}</span>
            </div>
            ${envio > 0 ? `<p style="font-size: 0.85rem; color: var(--color-secundario); margin: 10px 0;">Envío gratis en compras superiores a $50</p>` : ''}
            <div class="summary-row total">
                <span>Total</span>
                <span>$${totalFinal.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="procederAlCheckout()">Proceder al pago</button>
        </div>
    `;
}

/**
 * Calcular total del carrito
 */
function calcularTotal() {
    return carritoItems.reduce((total, item) => {
        const precio = parseFloat(item.info_producto.precio);
        return total + (precio * item.cantidad);
    }, 0);
}

/**
 * Incrementar cantidad de un producto
 */
window.incrementarCantidad = async function(itemId, cantidadActual, stock) {
    if (cantidadActual >= stock) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${stock} unidades disponibles`,
            ...getSwalConfig()
        });
        return;
    }
    
    try {
        await actualizarCantidad(itemId, cantidadActual + 1);
        await cargarCarrito();
    } catch (error) {
        console.error('Error al incrementar cantidad:', error);
    }
};

/**
 * Decrementar cantidad de un producto
 */
window.decrementarCantidad = async function(itemId, cantidadActual) {
    if (cantidadActual <= 1) {
        // Si la cantidad es 1, preguntar si quiere eliminar
        const result = await Swal.fire({
            icon: 'question',
            title: '¿Eliminar producto?',
            text: 'La cantidad mínima es 1. ¿Deseas eliminar este producto del carrito?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            ...getSwalConfig()
        });
        
        if (result.isConfirmed) {
            try {
                await eliminarDelCarrito(itemId);
                await cargarCarrito();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Producto eliminado',
                    text: 'El producto ha sido eliminado del carrito',
                    timer: 2000,
                    showConfirmButton: false,
                    ...getSwalConfig()
                });
            } catch (error) {
                console.error('Error al eliminar producto:', error);
            }
        }
        return;
    }
    
    try {
        await actualizarCantidad(itemId, cantidadActual - 1);
        await cargarCarrito();
    } catch (error) {
        console.error('Error al decrementar cantidad:', error);
    }
};

/**
 * Eliminar item del carrito
 */
window.eliminarItem = async function(itemId, nombreProducto) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de eliminar "${nombreProducto}" del carrito?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d01110',
        ...getSwalConfig()
    });
    
    if (result.isConfirmed) {
        try {
            await eliminarDelCarrito(itemId);
            await cargarCarrito();
            
            Swal.fire({
                icon: 'success',
                title: 'Producto eliminado',
                text: 'El producto ha sido eliminado del carrito',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                ...getSwalConfig()
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }
};

/**
 * Proceder al checkout
 */
window.procederAlCheckout = function() {
    window.location.href = 'pago.html';
};

/**
 * Escuchar eventos de actualización del carrito
 */
window.addEventListener('cart-updated', () => {
    cargarCarrito();
});

/**
 * Cargar carrito al iniciar
 */
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});
