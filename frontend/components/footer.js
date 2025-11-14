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
 * Crea y renderiza el footer
 */
export function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  
  const basePath = getBasePath();
  
  footer.innerHTML = `
    <div class="footer-container">
      <!-- Sección 1: Logo y descripción -->
      <div class="footer-section">
        <div class="footer-logo">
          <img src="${basePath}assets/img/kicks_logo.png" alt="KICKS Logo" class="footer-logo-img">
        </div>
        <p class="footer-description">
          Tu destino para encontrar el calzado perfecto. Calidad, estilo y comodidad en cada paso.
        </p>
        <div class="footer-social">
          <a href="https://www.instagram.com/kick5_shoe_store?igsh=cGszdTdobzhwM2hl" class="social-link" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://youtube.com/@kick5-m7i?si=yh7hmFcrCSPboBXk" class="social-link" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>
      </div>

      <!-- Sección 2: Enlaces rápidos -->
      <div class="footer-section">
        <h3 class="footer-title">Enlaces rápidos</h3>
        <ul class="footer-links">
          <li><a href="${basePath}index.html">Inicio</a></li>
          <li><a href="${basePath}tienda/productos.html">Productos</a></li>
          <li><a href="${basePath}tienda/nosotros.html">Nosotros</a></li>
          <li><a href="${basePath}tienda/contacto.html">Contacto</a></li>
        </ul>
      </div>

      <!-- Sección 3: Ayuda -->
      <div class="footer-section">
        <h3 class="footer-title">Ayuda</h3>
        <ul class="footer-links">
          <li><a href="${basePath}politica-privacidad/politica-privacidad.html">Política de privacidad</a></li>
        </ul>
      </div>

      <!-- Sección 4: Contacto -->
      <div class="footer-section">
        <h3 class="footer-title">Contacto</h3>
        <ul class="footer-contact">
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>123 Calle Principal, Ciudad</span>
          </li>
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>+1 (555) 123-4567</span>
          </li>
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>contacto@kicks.com</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright -->
    <div class="footer-bottom">
      <div class="footer-bottom-container">
        <p class="footer-copyright">
          &copy; ${new Date().getFullYear()} KICKS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
  
  // Agregar estilos
  addFooterStyles();
  
  return footer;
}

/**
 * Agrega los estilos CSS del footer
 */
function addFooterStyles() {
  // Verificar si los estilos ya fueron agregados
  if (document.getElementById('footer-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'footer-styles';
  style.textContent = `
    /* ============================================
       FOOTER
       ============================================ */
    .site-footer {
      background-color: var(--color-negro);
      color: var(--color-blanco);
      margin-top: 80px;
    }
    
    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 60px 20px 40px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }
    
    .footer-section {
      display: flex;
      flex-direction: column;
    }
    
    .footer-logo {
      margin-bottom: 20px;
    }
    
    .footer-logo-img {
      height: 50px;
      width: auto;
      filter: brightness(0) invert(1);
    }
    
    .footer-description {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .footer-social {
      display: flex;
      gap: 16px;
    }
    
    .social-link {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-blanco);
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      background-color: var(--color-acento);
      transform: translateY(-3px);
    }
    
    .footer-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--color-blanco);
      margin-bottom: 20px;
    }
    
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-links li {
      margin-bottom: 12px;
    }
    
    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      display: inline-block;
    }
    
    .footer-links a:hover {
      color: var(--color-acento);
      transform: translateX(5px);
    }
    
    .footer-contact {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-contact li {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
    }
    
    .footer-contact svg {
      flex-shrink: 0;
      color: var(--color-acento);
    }
    
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 24px 20px;
    }
    
    .footer-bottom-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .footer-copyright {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      margin: 0;
      text-align: center;
    }
    
     /* Responsive */
     @media (max-width: 768px) {
       .footer-container {
         grid-template-columns: 1fr;
         gap: 40px;
         padding: 40px 20px 30px;
       }
     }
  `;
  
  document.head.appendChild(style);
}

