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