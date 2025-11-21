/**
 * Componente ProductCard
 * Crea una tarjeta de producto reutilizable con toda la funcionalidad necesaria
 *
 * @param {Object} producto - Objeto con los datos del producto
 * @param {string} producto.id - ID único del producto
 * @param {string} producto.nombre - Nombre del producto
 * @param {string} producto.imagen - URL de la imagen del producto
 * @param {number} producto.precio - Precio actual del producto
 * @param {number} [producto.descuento] - Descuento en decimal (0-1), ej: 0.2 = 20% off
 * @param {string} [producto.categoria] - Categoría del producto
 * @param {boolean} [producto.esNuevo] - Si el producto es nuevo
 * @param {number} producto.cantidad - Cantidad disponible en stock
 * @returns {HTMLElement} - Elemento DOM de la tarjeta del producto
 */

import { obtenerUrlImagen } from '../js/utils/utilities.js';

export function ProductCard(producto) {
  const {
    id,
    nombre,
    imagen,
    imagenCompleta,
    precio,
    descuento = 0,
    hasDescuento = 0,
    categoria = 'General',
    esNuevo = false,
    stock = 0
  } = producto;          

  // Usar imagenCompleta si está disponible, sino usar imagen
  const imagenPath = imagenCompleta || imagen;
  const imagenUrl = obtenerUrlImagen(imagenPath);

  console.log('Imagen URL del producto:', imagenUrl);
  
  // Convertir precio y descuento a números (vienen como strings de MySQL)
  const precioOriginal = parseFloat(precio);
  const descuentoNum = parseFloat(descuento);
  
  // El descuento viene como decimal (0.10 = 10%)
  const tieneDescuento = hasDescuento === 1 && descuentoNum > 0;
  const discountPercent = tieneDescuento ? Math.round(descuentoNum * 100) : 0;
  
  // Calcular precio original si hay descuento
  const precioDescuento = tieneDescuento ? precioOriginal * (1 - descuentoNum) : null;
  
  const estaAgotado = stock === 0;

  // Crear el elemento card
  const card = document.createElement('div');
  card.className = 'product-card';
  if (estaAgotado) {
    card.classList.add('product-card--out-of-stock');
  }

  // HTML de la tarjeta
  card.innerHTML = `
    <div class="product-image" data-product-link>
      <div class="product-placeholder" style="background-image: url('${imagenUrl || ''}');">
        ${!imagenUrl ? '<div class="product-placeholder-bg"></div>' : ''}
      </div>
      ${esNuevo ? '<div class="product-badge product-badge--new">Nuevo</div>' : ''}
      ${tieneDescuento ? `<div class="product-badge product-badge--sale">-${discountPercent}%</div>` : ''}
      ${estaAgotado ? '<div class="product-badge product-badge--sold-out">Agotado</div>' : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name" data-product-link>${nombre}</h3>
      <p class="product-category">${categoria}</p>
      <div class="product-footer">
        ${tieneDescuento ? `
          <div class="product-price-group">
            <span class="product-price-old">$${precioOriginal.toFixed(2)}</span>
            <span class="product-price">$${precioDescuento.toFixed(2)}</span>
          </div>
        ` : `
          <span class="product-price">$${precioOriginal.toFixed(2)}</span>
        `}
        <button 
          class="product-cart-btn ${estaAgotado ? 'product-cart-btn--disabled' : ''}" 
          ${estaAgotado ? 'disabled' : ''}
          aria-label="${estaAgotado ? 'Producto agotado' : 'Agregar al carrito'}"
          title="${estaAgotado ? 'Producto agotado' : 'Agregar al carrito'}"
        >
          ${estaAgotado ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          `}
        </button>
      </div>
    </div>
  `;

  // Event listener para redirigir a la página del producto
  const clickableElements = card.querySelectorAll('[data-product-link]');
  clickableElements.forEach(element => {
    element.style.cursor = 'pointer';
    element.addEventListener('click', () => {
      // Usar ruta absoluta para que funcione desde cualquier ubicación
      const basePath = window.location.pathname.includes('/tienda/') ? './' : 'tienda/';
      window.location.href = `${basePath}producto.html?id=${id}`;
    });
  });

  // Event listener para el botón de agregar al carrito
  const cartBtn = card.querySelector('.product-cart-btn');
  if (!estaAgotado) {
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que se active el click del card
      // Usar el precio con descuento si existe, sino el precio original
      const precioFinal = tieneDescuento ? precioDescuento : precioOriginal;
      addToCartHandler(id, nombre, precioFinal, imagenUrl);
    });
  }

  return card;
}

/**
 * Función para agregar producto al carrito
 * @param {string} productId - ID del producto
 * @param {string} productName - Nombre del producto
 * @param {number} productPrice - Precio del producto
 * @param {string} productImage - URL de la imagen del producto
 */
async function addToCartHandler(productId, productName, productPrice, productImage) {
  try {
    // Importar la función addToCart desde auth.js y mostrarNotificacion desde utilities.js
    const { addToCart } = await import('../js/utils/auth.js');
    const { mostrarNotificacion } = await import('../js/utils/utilities.js');

    // Agregar al carrito (cantidad por defecto: 1)
    const result = await addToCart(productId, 1);

    if (result.success) {
      mostrarNotificacion(`${productName} agregado al carrito`, 'success');

    } else {
      mostrarNotificacion('Error al agregar producto al carrito', 'error');
      console.error('Error al agregar producto:', result.error);
    }

  } catch (error) {
    mostrarNotificacion('Error al agregar producto al carrito', 'error');
    console.error('Error al agregar producto al carrito:', error);
  }
}

/**
 * Renderiza múltiples productos en un contenedor
 * @param {Array} productos - Array de objetos producto
 * @param {HTMLElement} container - Contenedor donde se renderizarán las tarjetas
 */
export function renderProductCards(productos, container) {
  if (!container) {
    console.error('ProductCard: No se proporcionó un contenedor válido');
    return;
  }

  // Limpiar contenedor
  container.innerHTML = '';

  // Si no hay productos, mostrar mensaje
  if (!productos || productos.length === 0) {
    container.innerHTML = `
      <div class="products-empty">
        <p>No se encontraron productos</p>
      </div>
    `;
    return;
  }

  // Crear y agregar cada tarjeta
  productos.forEach(producto => {
    const card = ProductCard(producto);
    container.appendChild(card);
  });
}
