import { getCart, updateCartItem, removeFromCart, protectPage } from '../js/utils/auth.js';
import { cartIcon } from '../js/utils/icons.js';
import { API_URL } from './api/config.js';

await protectPage();
let carritoItems = [];

// Obtener URL completa de la imagen
function obtenerUrlImagen(imagenPath) {
    if (!imagenPath) return '';
    if (/^https?:\/\//i.test(imagenPath)) {
        return imagenPath;
    }
    const baseUrl = API_URL.replace('/api', ''); 
    return `${baseUrl}${imagenPath}`;
}

// Cargar carrito de la API y renderizar
async function cargarCarrito() {
    const container = document.getElementById('cart-content');
    
    try {
        const resultado = await getCart();
        
        if (resultado.success) {
            carritoItems = resultado.cart;
            
            if (carritoItems.length === 0) {
                mostrarCarritoVacio();
            } else {
                renderizarCarrito();
            }
        } else {
            throw new Error(resultado.error);
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

// Mostrar mensaje de carrito vacío
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

// Renderizar carrito con productos
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

// Calcular total del carrito
function calcularTotal() {
    return carritoItems.reduce((total, item) => {
        const precio = parseFloat(item.info_producto.precio);
        return total + (precio * item.cantidad);
    }, 0);
}

// Incrementar cantidad de un producto
window.incrementarCantidad = async function(itemId, cantidadActual, stock) {
    if (cantidadActual >= stock) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${stock} unidades disponibles`
        });
        return;
    }
    
    const resultado = await updateCartItem(itemId, cantidadActual + 1);
    
    if (resultado.success) {
        await cargarCarrito();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resultado.error
        });
    }
};

// Decrementar cantidad de un producto
window.decrementarCantidad = async function(itemId, cantidadActual) {
    if (cantidadActual <= 1) {
        const result = await Swal.fire({
            icon: 'question',
            title: '¿Eliminar producto?',
            text: 'La cantidad mínima es 1. ¿Deseas eliminar este producto del carrito?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            const resultado = await removeFromCart(itemId);
            
            if (resultado.success) {
                await cargarCarrito();
                Swal.fire({
                    icon: 'success',
                    title: 'Producto eliminado',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
        return;
    }
    
    const resultado = await updateCartItem(itemId, cantidadActual - 1);
    
    if (resultado.success) {
        await cargarCarrito();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resultado.error
        });
    }
};

// Eliminar item del carrito
window.eliminarItem = async function(itemId, nombreProducto) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de eliminar "${nombreProducto}" del carrito?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d01110'
    });
    
    if (result.isConfirmed) {
        const resultado = await removeFromCart(itemId);
        
        if (resultado.success) {
            await cargarCarrito();
            Swal.fire({
                icon: 'success',
                title: 'Producto eliminado',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.error
            });
        }
    }
};

// Proceder al checkout
window.procederAlCheckout = function() {
    window.location.href = 'pago.html';
};

// Cargar carrito al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});