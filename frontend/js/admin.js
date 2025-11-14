// ============================================
// INICIALIZACIÓN DE COMPONENTES
// ============================================
import { Header } from '../components/header.js';
import { ThemeBtn } from '../components/theme-btn.js';
import { 
    cargarProductos, 
    abrirModalCrear, 
    abrirModalEditar, 
    cerrarModal,
    enviarFormulario,
    eliminarProducto,
    seleccionarImagenes
} from './api/admin.js';

// ============================================
// HACER FUNCIONES GLOBALES
// ============================================
window.loadProducts = cargarProductos;
window.openCreateModal = abrirModalCrear;
window.openEditModal = abrirModalEditar;
window.closeModal = cerrarModal;
window.handleSubmit = enviarFormulario;
window.deleteProduct = eliminarProducto;
window.handleImageSelect = seleccionarImagenes;

// ============================================
// CARGAR PRODUCTOS AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar Header al inicio del body
    const body = document.querySelector('body');
    body.insertBefore(Header(), body.firstChild);
    
    // Renderizar Theme Toggle Button
    ThemeBtn();
    
    // Cargar productos
    cargarProductos();
    
    // Configurar drag and drop
    setupDragAndDrop();
});

// ============================================
// CONFIGURAR DRAG AND DROP PARA IMÁGENES
// ============================================
function setupDragAndDrop() {
    const uploadArea = document.getElementById('imageUploadArea');
    
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        document.getElementById('imagenes').files = files;
        handleImageSelect({ target: { files } });
    }, false);
}
