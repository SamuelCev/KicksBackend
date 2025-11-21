import { API_URL } from './api/config.js';
import { agregarAlCarrito } from './api/carrito.js';
import { cartIcon } from './utils/icons.js';
import { getSwalConfig } from './utils/utilities.js';

const BACKEND_URL = 'http://localhost:3000';
let currentProduct = null;
let currentQuantity = 1;
let currentImages = [];
let currentImageIndex = 0;

/**
 * Obtener URL completa de la imagen
 */
function obtenerUrlImagen(imagenPath) {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Cargar producto desde la API
 */
async function cargarProducto() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        mostrarError('No se especificó un producto');
        return;
    }

    const loading = document.getElementById('loading');
    const content = document.getElementById('product-content');
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        
        currentProduct = await response.json();
        
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
        cargarProductosRelacionados();
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        loading.style.display = 'none';
        mostrarError('No se pudo cargar el producto');
    }
}

/**
 * Renderizar producto en la página
 */
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

/**
 * Configurar event listeners
 */
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

/**
 * Cambiar imagen principal
 */
function cambiarImagen(index) {
    currentImageIndex = index;
    const mainImage = document.querySelector('#main-image img');
    mainImage.src = obtenerUrlImagen(currentImages[index]);
    
    // Actualizar thumbnails activos
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

/**
 * Actualizar cantidad en la UI
 */
function actualizarCantidad() {
    const quantityValue = document.getElementById('quantity-value');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnIncrease = document.getElementById('btn-increase');
    
    quantityValue.textContent = currentQuantity;
    btnDecrease.disabled = currentQuantity <= 1;
    btnIncrease.disabled = currentQuantity >= currentProduct.stock;
}

/**
 * Agregar producto al carrito
 */
async function agregarAlCarritoHandler() {
    if (!currentProduct || currentProduct.stock === 0) return;
    
    const btnAddCart = document.getElementById('btn-add-cart');
    btnAddCart.disabled = true;
    btnAddCart.innerHTML = '<span>Agregando...</span>';
    
    try {
        await agregarAlCarrito(currentProduct.id, currentQuantity, currentProduct.nombre);
        
        // Restaurar botón
        btnAddCart.disabled = false;
        btnAddCart.innerHTML = `${cartIcon}<span>Agregar al Carrito</span>`;
        
        // Resetear cantidad
        currentQuantity = 1;
        actualizarCantidad();
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        btnAddCart.disabled = false;
        btnAddCart.innerHTML = `${cartIcon}<span>Agregar al Carrito</span>`;
    }
}

/**
 * Cargar productos relacionados (misma categoría)
 */
async function cargarProductosRelacionados() {
    const grid = document.getElementById('related-grid');
    
    try {
        const response = await fetch(`${API_URL}/products/stock/categoria/${currentProduct.categoria}`);
        
        if (!response.ok) throw new Error('Error al cargar productos relacionados');
        
        let productos = await response.json();
        
        // Filtrar el producto actual y limitar a 4
        productos = productos
            .filter(p => p.id !== currentProduct.id)
            .slice(0, 4);
        
        if (productos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--color-secundario);">No hay productos relacionados</p>';
            return;
        }
        
        // Importar y renderizar product cards
        const { ProductCard } = await import('../components/product-card.js');
        
        grid.innerHTML = '';
        productos.forEach(producto => {
            const card = ProductCard(producto);
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error al cargar productos relacionados:', error);
        grid.innerHTML = '<p style="text-align: center; color: var(--color-secundario);">Error al cargar productos</p>';
    }
}

/**
 * Mostrar error
 */
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

/**
 * Inicializar
 */
document.addEventListener('DOMContentLoaded', () => {
    cargarProducto();
});
