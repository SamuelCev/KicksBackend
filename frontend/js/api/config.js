export const API_URL = 'http://127.0.0.1:3000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PERFIL: '/auth/perfil',
    CORREO_RECUPERACION: '/password/request-reset',
    REESTABLECER_CONTRASENA: '/password/reset',
    VERIFICAR_CODIGO: '/password/verify-code',
  },
  
  // Productos
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id) => `/products/${id}`,
    RANDOMS: '/products/randoms',
    STOCK_BY_CATEGORY: (categoria) => `/products/stock/categoria/${categoria}`,
    // Imágenes
    ADD_IMAGES: (id) => `/products/${id}/imagenes`,
    DELETE_IMAGE: (id, imageId) => `/products/${id}/imagenes/${imageId}`,
  },
  
  // Carrito
  CART: {
    BASE: '/cart',
    DELETE_ITEM: (itemId) => `/cart/${itemId}`,
    UPDATE_ITEM: (itemId) => `/cart/${itemId}`,
  },
  
  // Órdenes
  ORDERS: {
    BASE: '/ordenes',
    PAISES: '/ordenes/paises',
    INFO_TRANSFERENCIA: '/ordenes/info-transferencia',
    OXXO_DETAILS: '/ordenes/oxxo-details',
    VENTAS: '/ordenes/ventas',
    VENTAS_POR_CATEGORIA: '/ordenes/ventas-por-categoria',
  },
  
  // CAPTCHA
  CAPTCHA: {
    GENERATE: '/captcha/generate',
    VALIDATE: '/captcha/validate',
  },

  // Asistente Inteligente
  AI: {
    ASSISTANT: '/ai/chat',
  },

  // Otros
  SUSCRIPCION: '/suscripcion',
  CONTACT: '/contact',
};