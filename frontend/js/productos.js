import { renderProductCards } from '../components/product-card.js';
import { obtenerProductos } from './api/productos.js';

// ============================================
// VARIABLES GLOBALES
// ============================================
let todosLosProductos = [];
let productosFiltrados = [];

// Referencias a elementos del DOM
const productosGrid = document.getElementById('productos-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const discountFilter = document.getElementById('discount-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const resultsCount = document.getElementById('results-count');

// ============================================
// CARGAR PRODUCTOS INICIALES
// ============================================
async function cargarProductos() {
  try {
    // Mostrar loading
    productosGrid.innerHTML = `
      <div class="products-loading">
        <div class="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    `;

    // Obtener productos del backend
    todosLosProductos = await obtenerProductos();
    productosFiltrados = [...todosLosProductos];

    // Verificar si hay parámetros de categoría en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaParam = urlParams.get('categoria');
    
    if (categoriaParam) {
      categoryFilter.value = categoriaParam.toLowerCase();
    }

    // Aplicar filtros y renderizar
    aplicarFiltros();

  } catch (error) {
    console.error('Error al cargar productos:', error);
    productosGrid.innerHTML = `
      <div class="products-error">
        <p>No se pudieron cargar los productos en este momento.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Reintentar</button>
      </div>
    `;
  }
}

// ============================================
// APLICAR FILTROS
// ============================================
function aplicarFiltros() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value.toLowerCase();
  const selectedDiscount = discountFilter.value;

  // Filtrar productos
  productosFiltrados = todosLosProductos.filter(producto => {
    // Filtro de búsqueda
    const matchSearch = !searchTerm || 
      producto.nombre.toLowerCase().includes(searchTerm) ||
      (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm));

    // Filtro de categoría
    const matchCategory = !selectedCategory || 
      (producto.categoria && producto.categoria.toLowerCase() === selectedCategory);

    // Filtro de descuento
    let matchDiscount = true;
    if (selectedDiscount === 'true') {
      matchDiscount = producto.descuento && producto.descuento > 0;
    }

    return matchSearch && matchCategory && matchDiscount;
  });

  // Renderizar productos filtrados
  renderizarProductos();
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================
function renderizarProductos() {
  // Actualizar contador de resultados
  actualizarContador();

  // Si no hay productos, mostrar mensaje
  if (productosFiltrados.length === 0) {
    productosGrid.innerHTML = `
      <div class="products-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No se encontraron productos con los filtros seleccionados</p>
        <button onclick="document.getElementById('clear-filters').click()" class="btn btn-primary">
          Limpiar filtros
        </button>
      </div>
    `;
    return;
  }

  // Renderizar productos usando el componente
  renderProductCards(productosFiltrados, productosGrid);
}

// ============================================
// ACTUALIZAR CONTADOR DE RESULTADOS
// ============================================
function actualizarContador() {
  const total = todosLosProductos.length;
  const mostrados = productosFiltrados.length;

  if (mostrados === total) {
    resultsCount.textContent = `Mostrando ${total} producto${total !== 1 ? 's' : ''}`;
  } else {
    resultsCount.textContent = `Mostrando ${mostrados} de ${total} producto${total !== 1 ? 's' : ''}`;
  }
}

// ============================================
// LIMPIAR FILTROS
// ============================================
function limpiarFiltros() {
  searchInput.value = '';
  categoryFilter.value = '';
  discountFilter.value = '';
  
  // Limpiar parámetros de URL
  const url = new URL(window.location);
  url.search = '';
  window.history.replaceState({}, '', url);

  aplicarFiltros();
}

// ============================================
// EVENT LISTENERS
// ============================================
function inicializarEventListeners() {
  // Búsqueda con debounce
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      aplicarFiltros();
    }, 300);
  });

  // Filtros de select
  categoryFilter.addEventListener('change', aplicarFiltros);
  discountFilter.addEventListener('change', aplicarFiltros);

  // Botón limpiar filtros
  clearFiltersBtn.addEventListener('click', limpiarFiltros);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarEventListeners();
  cargarProductos();
});

// Exponer función para el botón de reintentar
window.recargarProductos = cargarProductos;
