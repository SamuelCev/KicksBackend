import { cartIcon, userIcon, menuIcon, closeIcon, adminIcon } from '../js/utils/icons.js';
import { isAuthenticated, logout, isAdmin, countCart } from '../js/utils/auth.js';

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

// Crea y renderiza el navbar
export async function Header() {
  const header = document.createElement('header');
  header.className = 'navbar';
  
  const isLoggedIn = await isAuthenticated();
  const isAdminUser = await isAdmin();
  const basePath = getBasePath();
  const cartCount = await countCart();
  const cartItemCount = cartCount.success ? cartCount.itemCount : 0;
  const displayCount = cartItemCount > 99 ? '99+' : cartItemCount;
  
  // Detectar tema actual
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const logoSrc = currentTheme === 'dark' 
    ? `${basePath}assets/img/kicks_logo_white.png` 
    : `${basePath}assets/img/kicks_logo.png`;
  
  header.innerHTML = `
    <nav class="navbar-container">
      <!-- Logo a la izquierda -->
      <div class="navbar-logo">
        <a href="${basePath}index.html">
          <img src="${logoSrc}" alt="KICKS Logo" class="logo-img" id="navbar-logo">
        </a>
      </div>
      
      <!-- Navegación en el centro -->
      <ul class="navbar-nav">
        <li><a href="${basePath}tienda/productos.html" class="nav-link">Productos</a></li>
        <li><a href="${basePath}tienda/nosotros.html" class="nav-link">Nosotros</a></li>
        <li><a href="${basePath}tienda/contacto.html" class="nav-link">Contacto</a></li>
        <li><a href="${basePath}tienda/suscripcion.html" class="nav-link">Suscripcion</a></li>
        <li><a href="${basePath}tienda/preguntas-frecuentes.html" class="nav-link">Preguntas Frecuentes</a></li>
      </ul>
      
      <!-- Acciones-->
      <div class="navbar-actions">
        ${isLoggedIn ? `
          ${isAdminUser ? `
            <a href="${basePath}admin/admin.html" class="navbar-icon-btn btn-admin" aria-lanel="Admin Panel" title="Panel de Administrador">
              ${ adminIcon }
            </a>
          ` : ''}
          <a href="${basePath}tienda/carrito.html" class="navbar-icon-btn cart-link" aria-label="Carrito">
            ${cartIcon}
            ${cartItemCount > 0 ? `<span class="cart-badge">${cartItemCount}</span>` : ''}
          </a>
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
        <li><a href="${basePath}tienda/suscripcion.html" class="mobile-nav-link">Suscripcion</a></li>
        <li><a href="${basePath}tienda/preguntas-frecuentes.html" class="mobile-nav-link">Preguntas Frecuentes</a></li>
        ${isLoggedIn ? `
          ${isAdminUser ? `
            <li>
              <a href="${basePath}admin/admin.html" class="mobile-nav-link mobile-nav-icon" aria-label="Admin">
                ${adminIcon}
                <span>Panel Admin</span>
              </a>
            </li>
          ` : ''}
          <li>
            <a href="${basePath}tienda/carrito.html" class="mobile-nav-link mobile-nav-icon cart-link" aria-label="Carrito">
              <div style="position: relative; display: inline-flex;">
                ${cartIcon}
                ${cartItemCount > 0 ? `<span class="cart-badge">${displayCount}</span>` : ''}
              </div>
              <span>Carrito</span>
            </a>
          </li>
          <li>
            <button class="mobile-nav-link mobile-nav-icon" aria-label="Cerrar sesión" data-action="logout" id="mobile-logout-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Cerrar sesión</span>
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
  
  // Agregar funcionalidad del menú de usuario
  if (isLoggedIn) {
    setupUserMenu(header);
  }
  
  // Agregar listener para cambio de tema
  setupThemeObserver(header, basePath);

  async function updateCartBadge() {
    const cartCount = await countCart();
    const cartItemCount = cartCount.success ? cartCount.itemCount : 0;
    const displayCount = cartItemCount > 99 ? '99+' : cartItemCount;
    
    const badges = header.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = displayCount;
    });
    
    if (cartItemCount === 0) {
      badges.forEach(badge => badge.style.display = 'none');
    } else {
      badges.forEach(badge => badge.style.display = 'flex');
    }
  }
  
  // Evento custom
  document.addEventListener('cartUpdated', updateCartBadge);
  
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

    .cart-link {
      position: relative; /* Importante para el badge */
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: var(--color-acento);
      color: white;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
      pointer-events: none; /* El badge no interfiere con clics */
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
      text-decoration: none;
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

    /* Menú de usuario flotante */
    .user-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background-color: var(--color-fondo);
      border: 2px solid var(--color-input-border);
      border-radius: 12px;
      padding: 8px;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 100;
    }

    .user-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .user-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--color-texto);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .user-menu-item:hover {
      background-color: var(--color-input-bg);
      color: var(--color-acento);
    }

    .user-menu-item svg {
      flex-shrink: 0;
    }

    .user-menu-divider {
      height: 1px;
      background-color: var(--color-input-border);
      margin: 8px 0;
    }

    .navbar-actions {
      position: relative;
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

/**
 * Configura la funcionalidad del menú de usuario
 */
function setupUserMenu(header) {
  // Crear el menú flotante
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.innerHTML = `
    <button class="user-menu-item" data-action="logout">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span>Cerrar sesión</span>
    </button>
  `;

  // Encontrar el botón de usuario en desktop y móvil
  const userBtnDesktop = header.querySelector('.navbar-actions .navbar-icon-btn[aria-label="Cuenta"]');
  const userBtnMobile = header.querySelector('.mobile-nav-icon[aria-label="Cuenta"]');

  // Agregar el menú al navbar-actions
  const navbarActions = header.querySelector('.navbar-actions');
  if (navbarActions) {
    navbarActions.appendChild(userMenu);
  }

  // Toggle del menú en desktop
  if (userBtnDesktop) {
    userBtnDesktop.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('active');
    });
  }

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !userBtnDesktop?.contains(e.target)) {
      userMenu.classList.remove('active');
    }
  });
  // Event listener para logout en móvil
  const mobileLogoutBtn = header.querySelector('#mobile-logout-btn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', async () => {
      const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que deseas cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel'
        }
      });
      
      if (result.isConfirmed) {
        await logout();
      }
    });
  }

  // Event listeners para las acciones del menú
  setupMenuActions(userMenu);
}

/**
 * Configura los event listeners de las acciones del menú de usuario
 */
function setupMenuActions(menu) {
  const menuItems = menu.querySelectorAll('.user-menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      const action = e.currentTarget.dataset.action;
      
      switch(action) {
        case 'profile':
          // TODO: Redirigir a perfil de usuario
          console.log('Ir a perfil');
          break;
        case 'orders':
          // TODO: Redirigir a pedidos
          console.log('Ir a mis pedidos');
          break;
        case 'logout':
          const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            customClass: {
              popup: 'swal2-popup',
              title: 'swal2-title',
              htmlContainer: 'swal2-html-container',
              confirmButton: 'swal2-confirm',
              cancelButton: 'swal2-cancel'
            }
          });
          
          if (result.isConfirmed) {
            await logout();
          }
          break;
      }
    });
  });
}


/**
 * Configura el observador para cambios de tema
 */
function setupThemeObserver(header, basePath) {
  const logo = header.querySelector('#navbar-logo');
  
  // Crear un observer para detectar cambios en el atributo data-theme
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newLogoSrc = currentTheme === 'dark' 
          ? `${basePath}assets/img/kicks_logo_white.png` 
          : `${basePath}assets/img/kicks_logo.png`;
        
        if (logo) {
          logo.src = newLogoSrc;
        }
      }
    });
  });
  
  // Observar cambios en el atributo data-theme del elemento html
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}
