// ============================================
// IMPORTS
// ============================================
import { getSwalConfig } from './utils/utilities.js';
import { API_URL } from './utils/config.js';
import { 
    getProducts,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductImages,
    deleteProductImage,
    protectAdminPage
} from './utils/auth.js';
import { Header } from '../components/header.js';
import { ThemeBtn } from '../components/theme-btn.js';

// ============================================
// VARIABLES GLOBALES
// ============================================
let productosActuales = [];
let productoEditando = null;
let imagenesSeleccionadas = [];
let imagenesExistentes = [];

// ============================================
// FUNCIONES AUXILIARES DE UI
// ============================================
function mostrarAlertaExito(mensaje, titulo = '¡Éxito!') {
    Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        ...getSwalConfig(),
        timer: 2000,
        showConfirmButton: false
    });
}

function mostrarAlertaError(mensaje, titulo = 'Error') {
    Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        ...getSwalConfig(),
        confirmButtonText: 'Entendido'
    });
}

async function mostrarConfirmacion(mensaje, titulo = '¿Estás seguro?') {
    const result = await Swal.fire({
        icon: 'warning',
        title: titulo,
        text: mensaje,
        ...getSwalConfig(),
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
}

function obtenerUrlImagen(imagenPath) {
    if (!imagenPath) return null;
    if (imagenPath.startsWith('http')) return imagenPath;
    return `${API_URL}${imagenPath}`;
}

function mostrarError(mensaje) {
    mostrarAlertaError(mensaje);
}

function mostrarExito(mensaje) {
    mostrarAlertaExito(mensaje);
}

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================
async function cargarProductos() {
    const loadingDiv = document.getElementById('loading');
    const container = document.getElementById('products-container');
    
    loadingDiv.classList.add('active');
    
    try {
        const categoria = document.getElementById('filter-categoria').value;
        const hasDescuento = document.getElementById('filter-descuento').value;
        
        const result = await getProducts(
            categoria || null,
            hasDescuento !== '' ? hasDescuento : null
        );
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        productosActuales = result.products;
        renderizarTablaProductos(productosActuales);
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p style="color: #dc3545;">Error al cargar los productos</p>
                <button class="btn btn-primary" onclick="loadProducts()">Reintentar</button>
            </div>
        `;
    } finally {
        loadingDiv.classList.remove('active');
    }
}

function renderizarTablaProductos(productos) {
    const container = document.getElementById('products-container');
    
    if (productos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3>No hay productos</h3>
                <p>Comienza agregando tu primer producto</p>
            </div>
        `;
        return;
    }
    
    const tabla = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(producto => `
                    <tr>
                        <td>
                            ${producto.imagen 
                                ? `<img src="${obtenerUrlImagen(producto.imagen)}" alt="${producto.nombre}" class="product-image-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/></svg>'">` 
                                : '<span style="font-size: 24px; color: var(--color-gris);">Sin imagen</span>'
                            }
                        </td>
                        <td><strong>${producto.nombre}</strong></td>
                        <td>${producto.marca || 'Sin marca'}</td>
                        <td>${producto.categoria}</td>
                        <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                        <td>
                            ${producto.hasDescuento === 1 
                                ? `<span class="badge badge-warning">${(parseFloat(producto.descuento) * 100).toFixed(0)}%</span>` 
                                : '-'
                            }
                        </td>
                        <td>${producto.stock}</td>
                        <td>
                            ${producto.estado === 1 
                                ? '<span class="badge badge-success">Activo</span>' 
                                : '<span class="badge badge-danger">Inactivo</span>'
                            }
                        </td>
                        <td>
                            <div class="product-actions">
                                <button class="btn btn-primary btn-small" onclick="openEditModal(${producto.id})">
                                    Editar
                                </button>
                                <button class="btn btn-danger btn-small" onclick="deleteProduct(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}')">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tabla;
}

// ============================================
// GESTIÓN DE MODALES
// ============================================
function abrirModalCrear() {
    productoEditando = null;
    imagenesSeleccionadas = [];
    imagenesExistentes = [];
    
    document.getElementById('modal-title').textContent = 'Nuevo Producto';
    document.getElementById('product-id').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('imagesPreview').innerHTML = '';
    document.getElementById('existing-images-group').style.display = 'none';
    document.getElementById('image-upload-group').style.display = 'block';
    document.getElementById('submit-btn').textContent = 'Crear Producto';
    
    document.getElementById('productModal').classList.add('active');
}

async function abrirModalEditar(id) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.add('active');
    
    try {
        const result = await getProductByID(id);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        productoEditando = result.product;
        imagenesSeleccionadas = [];
        imagenesExistentes = productoEditando.imagenes || [];
        
        // Llenar formulario
        document.getElementById('modal-title').textContent = 'Editar Producto';
        document.getElementById('product-id').value = productoEditando.id;
        document.getElementById('marca').value = productoEditando.marca || '';
        document.getElementById('nombre').value = productoEditando.nombre;
        document.getElementById('descripcion').value = productoEditando.descripcion;
        document.getElementById('precio').value = productoEditando.precio;
        document.getElementById('stock').value = productoEditando.stock;
        document.getElementById('categoria').value = productoEditando.categoria;
        document.getElementById('descuento').value = productoEditando.descuento;
        document.getElementById('submit-btn').textContent = 'Actualizar Producto';
        
        // Mostrar imágenes existentes
        if (imagenesExistentes.length > 0) {
            document.getElementById('existing-images-group').style.display = 'block';
            renderizarImagenesExistentes();
        } else {
            document.getElementById('existing-images-group').style.display = 'none';
        }
        
        document.getElementById('image-upload-group').style.display = 'block';
        document.getElementById('imagesPreview').innerHTML = '';
        
        document.getElementById('productModal').classList.add('active');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarAlertaError('No se pudo cargar la información del producto');
    } finally {
        loadingDiv.classList.remove('active');
    }
}

function renderizarImagenesExistentes() {
    const container = document.getElementById('existingImagesPreview');
    
    container.innerHTML = imagenesExistentes.map((imagen, index) => `
        <div class="image-preview-item" data-image-id="${imagen.id}">
            <img src="${obtenerUrlImagen(imagen.url)}" alt="Imagen ${index + 1}">
            <button type="button" class="remove-image" onclick="eliminarImagenExistente(${imagen.id})" title="Eliminar imagen">
                X
            </button>
        </div>
    `).join('');
}

function cerrarModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    document.getElementById('imagesPreview').innerHTML = '';
    document.getElementById('modal-error')?.classList.remove('active');
    document.getElementById('modal-success')?.classList.remove('active');
    imagenesSeleccionadas = [];
    imagenesExistentes = [];
    productoEditando = null;
}

// ============================================
// GESTIÓN DE IMÁGENES
// ============================================
async function eliminarImagenExistenteHandler(imageId) {
    const confirmado = await mostrarConfirmacion(
        'Esta acción no se puede deshacer',
        '¿Eliminar esta imagen?'
    );
    
    if (!confirmado) return;
    
    try {
        const productId = document.getElementById('product-id').value;
        
        // ✅ USAR FUNCIÓN DEL SERVICIO
        const result = await deleteProductImage(productId, imageId);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Actualizar array local
        imagenesExistentes = imagenesExistentes.filter(img => img.id !== imageId);
        renderizarImagenesExistentes();
        
        mostrarExito('Imagen eliminada correctamente');
        
        if (imagenesExistentes.length === 0) {
            document.getElementById('existing-images-group').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar la imagen');
    }
}

function seleccionarImagenes(event) {
    const files = Array.from(event.target.files);
    
    // Validar cantidad máxima (5 imágenes)
    if (files.length > 5) {
        mostrarError('Máximo 5 imágenes permitidas');
        return;
    }
    
    // Validar tamaño y tipo de cada archivo
    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of files) {
        if (!formatosPermitidos.includes(file.type)) {
            mostrarError(`Formato no permitido: ${file.name}`);
            return;
        }
        if (file.size > maxSize) {
            mostrarError(`Archivo muy grande: ${file.name} (máx. 5MB)`);
            return;
        }
    }
    
    imagenesSeleccionadas = files;
    renderizarVistaPrevia();
}

function renderizarVistaPrevia() {
    const container = document.getElementById('imagesPreview');
    container.innerHTML = '';
    
    imagenesSeleccionadas.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button type="button" class="remove-image" onclick="removerImagenSeleccionada(${index})" title="Remover">
                    ×
                </button>
            `;
            container.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
}

function removerImagenSeleccionadaHandler(index) {
    const filesArray = Array.from(imagenesSeleccionadas);
    filesArray.splice(index, 1);
    
    // Crear nuevo FileList
    const dt = new DataTransfer();
    filesArray.forEach(file => dt.items.add(file));
    
    document.getElementById('imagenes').files = dt.files;
    imagenesSeleccionadas = filesArray;
    
    renderizarVistaPrevia();
}

// ============================================
// GESTIÓN DE FORMULARIO
// ============================================
async function enviarFormulario(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const isEditing = !!productId;
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = isEditing ? 'Actualizando...' : 'Creando...';
    
    try {
        if (isEditing) {
            await actualizarProductoHandler(productId);
        } else {
            await crearProductoHandler();
        }
        
        cerrarModal();
        await cargarProductos();
        mostrarExito(isEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al guardar el producto');
        submitBtn.disabled = false;
        submitBtn.textContent = isEditing ? 'Actualizar Producto' : 'Crear Producto';
    }
}

async function crearProductoHandler() {
    const formData = new FormData();
    
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('stock', document.getElementById('stock').value);
    formData.append('categoria', document.getElementById('categoria').value);
    formData.append('descuento', document.getElementById('descuento').value);
    formData.append('marca', document.getElementById('marca').value);
    
    // Agregar imágenes
    imagenesSeleccionadas.forEach((file) => {
        formData.append('imagenes', file);
    });
    
    const result = await createProduct(formData);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.product;
}

async function actualizarProductoHandler(productId) {
    // 1. Actualizar datos del producto (sin imágenes)
    const data = {
        marca: document.getElementById('marca').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        categoria: document.getElementById('categoria').value,
        descuento: parseFloat(document.getElementById('descuento').value)
    };
    
    const result = await updateProduct(productId, data);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    // 2. Si hay nuevas imágenes, agregarlas
    if (imagenesSeleccionadas.length > 0) {
        await agregarImagenesAProductoHandler(productId);
    }
    
    return result.product;
}

async function agregarImagenesAProductoHandler(productId) {
    const formData = new FormData();
    
    imagenesSeleccionadas.forEach((file) => {
        formData.append('imagenes', file);
    });
    
    const result = await addProductImages(productId, formData);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.imagenes;
}

async function eliminarProductoHandler(id, nombre) {
    const confirmado = await mostrarConfirmacion(
        `El producto "${nombre}" será eliminado. Esta acción no se puede deshacer.`,
        '¿Eliminar producto?'
    );
    
    if (!confirmado) return;
    
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.add('active');
    
    try {
        const result = await deleteProduct(id);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        mostrarAlertaExito('El producto ha sido eliminado correctamente');
        await cargarProductos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarAlertaError('No se pudo eliminar el producto. Intenta nuevamente.');
    } finally {
        loadingDiv.classList.remove('active');
    }
}

// ============================================
// CONFIGURAR DRAG AND DROP
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
        seleccionarImagenes({ target: { files } });
    }, false);
}

// ============================================
// FUNCIONES GLOBALES (para onclick en HTML)
// ============================================
window.loadProducts = cargarProductos;
window.openCreateModal = abrirModalCrear;
window.openEditModal = abrirModalEditar;
window.closeModal = cerrarModal;
window.handleSubmit = enviarFormulario;
window.deleteProduct = eliminarProductoHandler;
window.handleImageSelect = seleccionarImagenes;
window.eliminarImagenExistente = eliminarImagenExistenteHandler;
window.removerImagenSeleccionada = removerImagenSeleccionadaHandler;

// ============================================
// INICIALIZACIÓN
// ============================================
async function inicializarPagina() {
    try {
        await protectAdminPage();

        // Renderizar Header al inicio del body
        const body = document.querySelector('body');
        const header = await Header();
        body.insertBefore(header, body.firstChild);
        
        // Renderizar Theme Toggle Button
        ThemeBtn();
        
        // Cargar productos
        await cargarProductos();
        
        // Configurar drag and drop
        setupDragAndDrop();
    } catch (error) {
        console.error('Error al inicializar página:', error);
        mostrarAlertaError('Error al cargar la página. Por favor, recarga.');
    }
}

// Llamar a la función de inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPagina);