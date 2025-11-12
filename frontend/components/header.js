import { cartIcon, userIcon, menuIcon, closeIcon } from '../js/utils/icons.js';
import { isAuthenticated } from '../js/utils/auth.js';

/**
 * Detecta la ruta base según la ubicación del archivo
 */
function getBasePath() {
  const path = window.location.pathname;
  // Si estamos en la raíz (index.html) o en frontend/, no usar ../
  if (path === '/' || path.endsWith('/index.html') || path.endsWith('/frontend/') || path.endsWith('/frontend/index.html')) {
    return '';
  }
  // Si estamos en un subdirectorio, usar ../
  return '../';
}

/**
 * Crea y renderiza el navbar
 */
export function Header() {
  const header = document.createElement('header');
  header.className = 'navbar';
  
  const isLoggedIn = isAuthenticated();
  const basePath = getBasePath();
  
  header.innerHTML = `
    <nav class="navbar-container">
      <!-- Logo a la izquierda -->
      <div class="navbar-logo">
        <a href="${basePath}index.html">
          <img src="${basePath}assets/img/kicks_logo.png" alt="KICKS Logo" class="logo-img">
        </a>
      </div>
      
      <!-- Navegación en el centro -->
      <ul class="navbar-nav">
        <li><a href="${basePath}tienda/productos.html" class="nav-link">Productos</a></li>
        <li><a href="${basePath}tienda/nosotros.html" class="nav-link">Nosotros</a></li>
        <li><a href="${basePath}tienda/contacto.html" class="nav-link">Contacto</a></li>
      </ul>
      
      <!-- Acciones a la derecha -->
      <div class="navbar-actions">
        ${isLoggedIn ? `
          <button class="navbar-icon-btn" aria-label="Carrito">
            ${cartIcon}
          </button>
          <button class="navbar-icon-btn" aria-label="Cuenta">
            ${userIcon}
          </button>
        ` : `
          <a href="${basePath}cuenta/login.html" class="btn btn-primary btn-login-nav">
            Login
          </a>
        `}
      </div>
      
      <!-- Botón menú hamburguesa (solo visible en móvil) -->
      <button class="navbar-toggle" aria-label="Menú" aria-expanded="false">
        ${menuIcon}
      </button>
    </nav>
    
    <!-- Menú móvil -->
    <div class="navbar-mobile-menu">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">Menú</span>
        <button class="mobile-menu-close" aria-label="Cerrar menú">
          ${closeIcon}
        </button>
      </div>
      <ul class="mobile-nav">
        <li><a href="${basePath}tienda/productos.html" class="mobile-nav-link">Productos</a></li>
        <li><a href="${basePath}tienda/nosotros.html" class="mobile-nav-link">Nosotros</a></li>
        <li><a href="${basePath}tienda/contacto.html" class="mobile-nav-link">Contacto</a></li>
        ${isLoggedIn ? `
          <li>
            <button class="mobile-nav-link mobile-nav-icon" aria-label="Carrito">
              ${cartIcon}
              <span>Carrito</span>
            </button>
          </li>
          <li>
            <button class="mobile-nav-link mobile-nav-icon" aria-label="Cuenta">
              ${userIcon}
              <span>Cuenta</span>
            </button>
          </li>
        ` : `
          <li>
            <a href="${basePath}cuenta/login.html" class="btn btn-primary btn-login-mobile">
              Login
            </a>
          </li>
        `}
      </ul>
    </div>
  `;
  
  // Agregar estilos
  addHeaderStyles();
  
  // Agregar funcionalidad del menú hamburguesa
  setupMobileMenu(header);
  
  return header;
}

/**
 * Agrega los estilos CSS del header
 */
function addHeaderStyles() {
  // Verificar si los estilos ya fueron agregados
  if (document.getElementById('header-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'header-styles';
  style.textContent = `
    /* ============================================
       NAVBAR
       ============================================ */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: var(--color-fondo);
      border-bottom: 1px solid var(--color-input-border);
      transition: background-color 0.3s ease;
    }
    
    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    
    /* Logo */
    .navbar-logo {
      flex-shrink: 0;
    }
    
    .navbar-logo a {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    
    .logo-img {
      height: 50px;
      width: auto;
      object-fit: contain;
    }
    
    /* Navegación central */
    .navbar-nav {
      display: flex;
      list-style: none;
      gap: 32px;
      margin: 0;
      padding: 0;
      flex: 1;
      justify-content: center;
    }
    
    .nav-link {
      color: var(--color-texto);
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      transition: color 0.3s ease;
      position: relative;
    }
    
    .nav-link:hover {
      color: var(--color-acento);
    }
    
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-acento);
      transition: width 0.3s ease;
    }
    
    .nav-link:hover::after {
      width: 100%;
    }
    
    /* Acciones del navbar */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    
    .navbar-icon-btn {
      background: none;
      border: none;
      color: var(--color-texto);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .navbar-icon-btn:hover {
      background-color: var(--color-input-bg);
      color: var(--color-acento);
      transform: translateY(-2px);
    }
    
    .btn-login-nav {
      padding: 10px 24px;
      font-size: 0.95rem;
      text-decoration: none;
      display: inline-block;
    }
    
    /* Botón menú hamburguesa */
    .navbar-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--color-texto);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .navbar-toggle:hover {
      background-color: var(--color-input-bg);
    }
    
    /* Menú móvil */
    .navbar-mobile-menu {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: var(--color-fondo);
      z-index: 2000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }
    
    .navbar-mobile-menu.active {
      transform: translateX(0);
    }
    
    .mobile-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--color-input-border);
    }
    
    .mobile-menu-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-texto);
    }
    
    .mobile-menu-close {
      background: none;
      border: none;
      color: var(--color-texto);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .mobile-menu-close:hover {
      background-color: var(--color-input-bg);
    }
    
    .mobile-nav {
      list-style: none;
      padding: 20px;
      margin: 0;
    }
    
    .mobile-nav li {
      margin-bottom: 12px;
    }
    
    .mobile-nav-link {
      display: block;
      color: var(--color-texto);
      text-decoration: none;
      font-weight: 500;
      font-size: 1.1rem;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-input-border);
      transition: color 0.3s ease;
    }
    
    .mobile-nav-link:hover {
      color: var(--color-acento);
    }
    
    .mobile-nav-icon {
      display: flex;
      align-items: center;
      gap: 12px;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      border-bottom: 1px solid var(--color-input-border);
    }
    
    .mobile-nav-icon svg {
      flex-shrink: 0;
    }
    
    .btn-login-mobile {
      width: 100%;
      text-align: center;
      margin-top: 20px;
      text-decoration: none;
      display: inline-block;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .navbar-nav {
        display: none;
      }
      
      .navbar-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .navbar-mobile-menu {
        display: block;
      }
      
      .navbar-actions {
        display: none;
      }
      
      .navbar-icon-btn {
        padding: 6px;
      }
      
      .btn-login-nav {
        display: none;
      }
    }
    
    @media (max-width: 480px) {
      .navbar-container {
        padding: 0 16px;
      }
      
      .logo-img {
        height: 40px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Configura la funcionalidad del menú móvil
 */
function setupMobileMenu(header) {
  const toggleBtn = header.querySelector('.navbar-toggle');
  const mobileMenu = header.querySelector('.navbar-mobile-menu');
  const closeBtn = header.querySelector('.mobile-menu-close');
  
  // Abrir menú
  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });
  
  // Cerrar menú
  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
  
  // Cerrar al hacer clic en un enlace
  const mobileLinks = header.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  
  // Cerrar al hacer clic fuera del menú
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      mobileMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

