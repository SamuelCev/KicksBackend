import { cartIcon } from './utils/icons.js';
import { getProductByID, addToCart, getCart } from './utils/auth.js';
import { obtenerUrlImagen, mostrarNotificacion } from './utils/utilities.js';

let currentProduct = null;
let currentQuantity = 1;
let currentImages = [];
let currentImageIndex = 0;

// Obtener ID del producto desde la URL
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar producto desde la API
async function cargarProducto() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        mostrarError('No se especificó un producto');
        return;
    }

    const loading = document.getElementById('loading');
    const content = document.getElementById('product-content');
    
    try {
        // Usar función de auth.js en lugar de fetch directo
        const response = await getProductByID(productId);
        
        if (!response.success) {
            throw new Error(response.error || 'Producto no encontrado');
        }
        
        currentProduct = response.product;
        
        // Preparar array de imágenes
        currentImages = [];
        if (currentProduct.imagen) {
            currentImages.push(currentProduct.imagen);
        }
        if (currentProduct.imagenes && currentProduct.imagenes.length > 0) {
            currentImages.push(...currentProduct.imagenes.map(img => img.url_imagen));
        }
        
        loading.style.display = 'none';
        content.style.display = 'block';
        
        renderizarProducto();
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        loading.style.display = 'none';
        mostrarError('No se pudo cargar el producto');
    }
}

// Renderizar producto en la página
function renderizarProducto() {
    const content = document.getElementById('product-content');
    
    const precio = parseFloat(currentProduct.precio);
    const hasDescuento = currentProduct.hasDescuento;
    const descuento = parseFloat(currentProduct.descuento) || 0;
    const precioFinal = hasDescuento ? precio * (1 - descuento) : precio;
    const stock = currentProduct.stock || 0;
    
    // Determinar estado del stock
    let stockBadgeClass = 'in-stock';
    let stockText = `${stock} disponibles`;
    
    if (stock === 0) {
        stockBadgeClass = 'out-of-stock';
        stockText = 'Agotado';
    } else if (stock <= 5) {
        stockBadgeClass = 'low-stock';
        stockText = `Solo ${stock} disponibles`;
    }
    
    content.innerHTML = `
        <!-- Product Grid -->
        <div class="product-content">
            <!-- Gallery -->
            <div class="product-gallery">
                <div class="main-image" id="main-image">
                    <img src="${obtenerUrlImagen(currentImages[0])}" alt="${currentProduct.nombre}">
                </div>
                ${currentImages.length > 1 ? `
                    <div class="thumbnail-gallery">
                        ${currentImages.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <img src="${obtenerUrlImagen(img)}" alt="${currentProduct.nombre} ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Product Info -->
            <div class="product-info">
                <span class="product-category">${currentProduct.categoria}</span>
                
                <h1 class="product-title">${currentProduct.nombre}</h1>
                
                <div class="product-price-section">
                    <span class="product-price">$${precioFinal.toFixed(2)}</span>
                    ${hasDescuento ? `
                        <span class="product-price-original">$${precio.toFixed(2)}</span>
                        <span class="product-discount-badge">-${(descuento * 100).toFixed(0)}%</span>
                    ` : ''}
                </div>

                <p class="product-description">${currentProduct.descripcion || 'Sin descripción disponible'}</p>

                <!-- Product Details -->
                <div class="product-details">
                    <div class="detail-row">
                        <span class="detail-label">Marca:</span>
                        <span class="detail-value">${currentProduct.marca || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Disponibilidad:</span>
                        <span class="detail-value">
                            <span class="stock-badge ${stockBadgeClass}">
                                <span class="stock-dot"></span>
                                ${stockText}
                            </span>
                        </span>
                    </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="product-actions">
                    <div class="quantity-selector">
                        <span class="quantity-label">Cantidad:</span>
                        <div class="quantity-control">
                            <button class="quantity-btn" id="btn-decrease" ${stock === 0 ? 'disabled' : ''}>-</button>
                            <span class="quantity-value" id="quantity-value">1</span>
                            <button class="quantity-btn" id="btn-increase" ${stock === 0 ? 'disabled' : ''}>+</button>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn-add-to-cart" id="btn-add-cart" ${stock === 0 ? 'disabled' : ''}>
                            ${cartIcon}
                            <span>${stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar event listeners
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    // Thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index);
            cambiarImagen(index);
        });
    });
    
    // Quantity controls
    const btnDecrease = document.getElementById('btn-decrease');
    const btnIncrease = document.getElementById('btn-increase');
    
    if (btnDecrease) {
        btnDecrease.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                actualizarCantidad();
            }
        });
    }
    
    if (btnIncrease) {
        btnIncrease.addEventListener('click', () => {
            if (currentQuantity < currentProduct.stock) {
                currentQuantity++;
                actualizarCantidad();
            }
        });
    }
    
    // Add to cart
    const btnAddCart = document.getElementById('btn-add-cart');
    if (btnAddCart) {
        btnAddCart.addEventListener('click', agregarAlCarritoHandler);
    }
}

// Cambiar imagen principal
function cambiarImagen(index) {
    currentImageIndex = index;
    const mainImage = document.querySelector('#main-image img');
    mainImage.src = obtenerUrlImagen(currentImages[index]);
    
    // Actualizar thumbnails activos
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Actualizar cantidad en la UI
function actualizarCantidad() {
    const quantityValue = document.getElementById('quantity-value');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnIncrease = document.getElementById('btn-increase');
    
    quantityValue.textContent = currentQuantity;
    btnDecrease.disabled = currentQuantity <= 1;
    btnIncrease.disabled = currentQuantity >= currentProduct.stock;
}

// Agregar producto al carrito usando auth.js
async function agregarAlCarritoHandler() {
    if (!currentProduct || currentProduct.stock === 0) return;
    
    const btnAddCart = document.getElementById('btn-add-cart');
    const originalContent = btnAddCart.innerHTML;
    btnAddCart.disabled = true;
    btnAddCart.innerHTML = '<span>Agregando...</span>';
    
    try {
        const response = await addToCart(currentProduct.id, currentQuantity);
        
        if (response.success) {
            // Mostrar mensaje de éxito
            mostrarNotificacion('Producto agregado al carrito', 'success');
            
            // Resetear cantidad
            currentQuantity = 1;
            actualizarCantidad();
            
            // Actualizar contador del carrito si existe
            actualizarContadorCarrito();
        } else {
             if (response.error === 'No autorizado. Falta el token.' || 
                response.error?.includes('No autorizado') ||
                response.error?.includes('token')) {
                window.location.href = '../cuenta/login.html';
                return;
            }
            // Mostrar error para otros casos
            mostrarNotificacion(response.error || 'Error al agregar al carrito', 'error');
        }
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacion('Error al agregar al carrito', 'error');
    } finally {
        // Restaurar botón
        btnAddCart.disabled = false;
        btnAddCart.innerHTML = originalContent;
    }
}

// Actualizar contador del carrito en el header
async function actualizarContadorCarrito() {
    try {
        const response = await getCart();
        
        if (response.success) {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const totalItems = response.cart.reduce((sum, item) => sum + item.cantidad, 0);
                cartCount.textContent = totalItems;
                cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Error al actualizar contador del carrito:', error);
    }
}

// Mostrar error
function mostrarError(mensaje) {
    const content = document.getElementById('product-content');
    content.style.display = 'block';
    content.innerHTML = `
        <div class="product-error">
            <h2 class="error-title">Error</h2>
            <p class="error-message">${mensaje}</p>
            <a href="productos.html" class="btn-back-home">Ver Productos</a>
        </div>
    `;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarProducto();
    
    // Agregar estilos para las animaciones de notificaciones
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});