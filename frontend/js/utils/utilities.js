import { API_URL } from './config.js';

// Obtener configuración de SweetAlert según el tema actual
export function getSwalConfig() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        background: isDark ? '#1a1a1a' : '#ffffff',
        color: isDark ? '#e0e0e0' : '#333333',
        confirmButtonColor: isDark ? '#4a9eff' : '#007bff',
        cancelButtonColor: isDark ? '#6c757d' : '#6c757d',
        iconColor: isDark ? '#4a9eff' : '#007bff'
    };
}

// Obtener URL completa de la imagen
export function obtenerUrlImagen(imagenPath) {
    if (!imagenPath) return '';
    
    // Si ya es una URL completa, retornarla
    if (imagenPath.startsWith('http://') || imagenPath.startsWith('https://')) {
        return imagenPath;
    }
    
    // Si es una ruta relativa, construir URL completa
    return `${API_URL}${imagenPath.startsWith('/') ? '' : '/'}${imagenPath}`;
}

export function mostrarNotificacion(mensaje, tipo = 'success', duracion = 3000) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info'
        title: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: duracion,
        timerProgressBar: true,
        background: isDark ? '#1a1a1a' : '#ffffff',
        color: isDark ? '#e0e0e0' : '#333333',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}