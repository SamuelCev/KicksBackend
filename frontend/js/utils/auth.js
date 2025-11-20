import { API_URL, API_ENDPOINTS } from './config.js';

// Variable temporal en memoria para el usuario actual
let currentUser = null;

// Función auxiliar para obtener la ruta relativa al root
function getPathToRoot() {
    const path = window.location.pathname;
    // Casos: /index.html, /cuenta/login.html, /tienda/productos.html, /admin/admin.html, etc.
    if (path.includes('/cuenta/') || path.includes('/tienda/') || path.includes('/admin/') || path.includes('/politica-privacidad/')) {
        return '../';
    }
    return './';
}
// Verificar si el usuario esta autenticado
export async function isAuthenticated() {
    // Si ya tenemos el usuario en memoria, retornar true
    if (currentUser) {
        return true;
    }
    
    // Intentar obtener el perfil del backend
    const result = await getProfile();
    
    if (result.success) {
        currentUser = result.user;
        return true;
    }
    
    return false;
}
// Verificar si el usuario es admin
export async function isAdmin() {
    if (currentUser) {
        return currentUser.rol === 1;
    }
    
    const response = await getProfile();
    if (response.success) {
        currentUser = response.user;
        return response.user.rol === 1;
    }
    
    return false;
}
// Redirigir si no esta autenticado
export async function protectPage() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
        // Redirigir a login usando la ruta correcta
        const pathToRoot = getPathToRoot();
        window.location.href = `${pathToRoot}cuenta/login.html`;
    }
}
// Redirigir si no es admin
export async function protectAdminPage() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
        // No está autenticado, redirigir a login
        const pathToRoot = getPathToRoot();
        window.location.href = `${pathToRoot}cuenta/login.html`;
        return;
    }
    
    const admin = await isAdmin();
    
    if (!admin) {
        // Está autenticado pero no es admin, redirigir al home
        const pathToRoot = getPathToRoot();
        window.location.href = `${pathToRoot}index.html`;
    }
}
// Redirigir de paginas de login y registro si ya estas autenticado
export async function redirectIfAuthenticated() {
    const authenticated = await isAuthenticated();
    
    if (authenticated) {
        const pathToRoot = getPathToRoot();
        window.location.href = `${pathToRoot}index.html`;
    }
}

//============================================
// Endpoints de autenticacion
//============================================
// Iniciar sesion
export async function login(email, password) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.LOGIN,
            'POST',
            { email, password }
        );
        if (response.ok) {
            return { 
                success: true, 
                user: response.user 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al iniciar sesión' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Cerrar sesion 
export async function logout() {
    try {
        await peticionAPI(
            API_ENDPOINTS.AUTH.LOGOUT, 
            'POST'
        );
    } catch (error) {
        console.error('Error al cerrar Sesión ', error);
    }

    currentUser = null;
    
    // Redirigir al home usando la ruta correcta
    const pathToRoot = getPathToRoot();
    window.location.href = `${pathToRoot}index.html`;
}
// Registrar Usuario
export async function register(nombre, email, password) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.REGISTER,
            'POST',
            { nombre, email, password }
        );
        if (response.ok) {
            return { 
                success: true, 
                user: response.user 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al registrar usuario' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Consultar perfil del usuario
export async function getProfile() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.PERFIL,
            'GET'
        );
        if (response.ok) {
            return { 
                success: true, 
                user: {
                    id: response.id,
                    nombre: response.nombre,
                    email: response.email,
                    rol: response.rol
                }
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener perfil' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Actualizar perfil del usuario
export async function updateProfile(nombre, email) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.PERFIL,
            'PUT',
            { nombre, email }
        );
        if (response.ok) {
            return { 
                success: true, 
                user: response.user 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al actualizar perfil' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Cambiar contraseña
export async function changePassword(currentPassword, newPassword) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.CAMBIAR_PASSWORD,
            'PUT',
            { currentPassword, newPassword }
        );
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al cambiar contraseña' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Enviar correo electronico con codigo de verificacion
export async function resetPasswordEmail(email) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.CORREO_RECUPERACION,
            'POST',
            { email }
        );
        if (response.ok) {
            return {
                success: true,
                message: response.message
            };
        } else {
            return {
                success: false,
                error: response.error || 'Error al enviar correo de recuperación'
            };
        }

    } catch (error) {
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}
// Verificar que el codigo capturado sea correcto
export async function verifyCode(email, code) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.VERIFICAR_CODIGO,
            'POST',
            { email, code }
        );
        if (response.ok) {
            return {
                success: true,
                message: response.message,
                resetToken: response.resetToken
            };
        } else {
            return {
                success: false,
                error: response.error || 'Código incorrecto o expirado'
            };
        }

    } catch (error) {
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}
// Cambiar la contraseña
export async function resetPassword(resetToken, newPassword) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AUTH.REESTABLECER_CONTRASENA,
            'POST',
            { resetToken, newPassword }
        );
        if (response.ok) {
            return {
                success: true,
                message: response.message
            };
        } else {
            return {
                success: false,
                error: response.error || 'Error al restablecer contraseña'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}

//============================================
// Endpoints de Productos
//============================================
// Obtener todos los productos disponibles
export async function getProducts(categoria = null, hasDescuento = null) {
    try {
        let url = API_ENDPOINTS.PRODUCTS.BASE;
        const params = new URLSearchParams();
        
        if (categoria) params.append('categoria', categoria);
        if (hasDescuento !== null) params.append('hasDescuento', hasDescuento);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await peticionAPI(url, 'GET');
        
        if (response.ok) {
            let productos = response.data || response;
            
            if (!Array.isArray(productos)) {
                const keys = Object.keys(productos).filter(k => !['ok', 'status', 'data'].includes(k));

                if (keys.length > 0 && keys.every(k => !isNaN(k))) {
                    productos = keys
                        .map(k => productos[k])
                        .filter(v => v && typeof v === 'object');
                } else {
                    productos = [];
                }
            }

            return {
                success: true,
                products: productos
            }
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener productos' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener un producto por su ID
export async function getProductByID(id) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.BY_ID(id),
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                product: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Producto no encontrado' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener productos aleatorios para mostrar en home page
export async function getRandomProducts() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.RANDOMS,
            'GET'
        );

        if (response.ok) {
            let productos = response.data || response;

            // Si no es un array, intentar convertirlo (igual que en getProducts)
            if (!Array.isArray(productos)) {
                const keys = Object.keys(productos).filter(k => !['ok', 'status', 'data'].includes(k));

                if (keys.length > 0 && keys.every(k => !isNaN(k))) {
                    productos = keys
                        .map(k => productos[k])
                        .filter(v => v && typeof v === 'object');
                } else {
                    productos = [];
                }
            }

            return {
                success: true,
                products: productos
            };
        } else {
            return {
                success: false,
                error: response.error || 'Error al obtener productos aleatorios'
            };
        }
    } catch(error) {
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}
// Obtener stock por categoría
export async function getStockByCategory(categoria) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.STOCK_BY_CATEGORY(categoria),
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                stock: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener stock' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Crear nuevo producto (ADMIN)
export async function createProduct(formData) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.BASE,
            'POST',
            formData
        );
        
        if (response.ok) {
            return { 
                success: true, 
                product: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al crear producto' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Actualizar producto (ADMIN)
export async function updateProduct(id, productData) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.BY_ID(id),
            'PUT',
            productData
        );
        
        if (response.ok) {
            return { 
                success: true, 
                product: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al actualizar producto' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Eliminar producto (ADMIN - soft delete)
export async function deleteProduct(id) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.BY_ID(id),
            'DELETE'
        );
        
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al eliminar producto' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Agregar imágenes a producto (ADMIN)
export async function addProductImages(id, formData) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.ADD_IMAGES(id),
            'POST',
            formData
        );
        
        if (response.ok) {
            return { 
                success: true, 
                imagenes: response.imagenes 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al agregar imágenes' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Eliminar imagen de producto (ADMIN)
export async function deleteProductImage(productId, imageId) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.PRODUCTS.DELETE_IMAGE(productId, imageId),
            'DELETE'
        );
        
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al eliminar imagen' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}

//============================================
// Endpoints del Carrito
//============================================
// Obtener carrito del usuario
export async function getCart() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CART.BASE,
            'GET'
        );
        
        if (response.ok) {
            const cartData = Array.isArray(response) ? response : 
                           (response.cart || response.data || []);
            return { 
                success: true, 
                cart: cartData 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener carrito' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Agregar producto al carrito
export async function addToCart(productId, cantidad) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CART.BASE,
            'POST',
            { productId, cantidad }
        );
        
        if (response.ok) {
            return { 
                success: true, 
                item: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al agregar al carrito' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Actualizar cantidad de un item en el carrito
export async function updateCartItem(itemId, cantidad) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CART.UPDATE_ITEM(itemId),
            'PUT',
            { cantidad }
        );
        
        if (response.ok) {
            return { 
                success: true,
                item: response
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al actualizar cantidad' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Eliminar item del carrito
export async function removeFromCart(itemId) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CART.DELETE_ITEM(itemId),
            'DELETE'
        );
        
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al eliminar del carrito' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}

//============================================
// Endpoints de Órdenes
//============================================
// Crear nueva orden
export async function createOrder(orderData) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.BASE,
            'POST',
            orderData
        );
        
        if (response.ok) {
            return { 
                success: true, 
                orderId: response.orderId 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al crear orden' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Verificar cupon
export async function verifyCoupon(codigo) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.CUPON,
            'POST',
            { cupon: codigo }
        );
        if (response.ok) {
            return { 
                success: true, 
                descuento: response.descuento 
            };
        } else {
            return { 
                success: false, 
                error: response.message || response.error || 'Cupón inválido'
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener países disponibles
export async function getPaises() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.PAISES,
            'GET'
        );
        
        if (response.ok && response.data) {
            return { 
                success: true, 
                paises: response.data 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener países' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener información de transferencia
export async function getInfoTransferencia() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.INFO_TRANSFERENCIA,
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                info: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener info de transferencia' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener detalles de pago OXXO
export async function getOxxoDetails() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.OXXO_DETAILS,
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                referencia: response.referencia 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener detalles OXXO' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener ventas totales (ADMIN)
export async function getVentas() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.VENTAS,
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                totalVentas: response.totalVentas 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener ventas' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Obtener ventas por categoría (ADMIN)
export async function getVentasPorCategoria() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.ORDERS.VENTAS_POR_CATEGORIA,
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                ventas: response 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al obtener ventas por categoría' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}

//============================================
// Endpoints de CAPTCHA
//============================================
// Generar CAPTCHA
export async function generateCaptcha() {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CAPTCHA.GENERATE,
            'GET'
        );
        
        if (response.ok) {
            return { 
                success: true, 
                captchaId: response.captchaId,
                image: response.image  
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al generar CAPTCHA' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Validar CAPTCHA
export async function validateCaptcha(captchaId, answer) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CAPTCHA.VALIDATE,
            'POST',
            { captchaId, answer }
        );
        
        if (response.ok) {
            return { 
                success: true, 
                valid: response.valid 
            };
        } else {
            return { 
                success: false, 
                valid: false,
                error: response.error || response.message || 'CAPTCHA inválido' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            valid: false,
            error: 'Error de conexión con el servidor' 
        };
    }
}

//============================================
// Otros Endpoints
//============================================
// Suscribirse al newsletter
export async function suscribirseNewsletter(email) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.SUSCRIPCION,
            'POST',
            { email }
        );
        
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al suscribirse' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}
// Enviar mensaje de contacto
export async function enviarContacto(email) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.CONTACT,
            'POST',
            { email }
        );
        
        if (response.ok) {
            return { 
                success: true 
            };
        } else {
            return { 
                success: false, 
                error: response.error || 'Error al enviar mensaje' 
            };
        }
    } catch(error) {
        return { 
            success: false, 
            error: 'Error de conexión con el servidor' 
        };
    }
}

//============================================
// Asistente Inteligente
//============================================
export async function inferenceAIAssistant(messages) {
    try {
        const response = await peticionAPI(
            API_ENDPOINTS.AI.ASSISTANT,
            'POST',
            { messages }
        );
        return response;
    } catch (error) {
        console.error('Error en inferenceAIAssistant:', error);
        return { ok: false, error: 'Error de conexión con el servidor' };
    }
}

//============================================
// Funciones auxiliares
//============================================
// Hacer petición al backend
export async function peticionAPI(endpoint, method = 'GET', body = null, esperaArchivo = false) {
    const url = `${API_URL}${endpoint}`; 
    
    const opciones = {
        method: method,
        credentials: 'include', 
        headers: {}
    };
    
    // Solo agregar Content-Type si no es FormData
    if (body && !(body instanceof FormData)) {
        opciones.headers['Content-Type'] = 'application/json';
    }
    
    // Si hay body
    if (body) {
        if (body instanceof FormData) {
            opciones.body = body;
        } else if (typeof body !== 'string') {
            opciones.body = JSON.stringify(body);
        } else {
            opciones.body = body;
        }
    }
    
    try {
        const response = await fetch(url, opciones);
        const contentType = response.headers.get('content-type');
        
        if (esperaArchivo || contentType?.includes('application/pdf') || 
            contentType?.includes('application/octet-stream') ||
            contentType?.includes('image/')) {
            
            const blob = await response.blob();
            return {
                ok: response.ok,
                status: response.status,
                data: blob,
                contentType: contentType,
                esArchivo: true
            };
        } else {
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Token inválido o expirado');
                    // Limpiar el usuario actual para evitar bucles
                    currentUser = null;
                }
                
                return {
                    ok: false,
                    status: response.status,
                    error: data.error || data.message || 'Error en la petición',
                    ...data
                };
            }
            
            if (Array.isArray(data)) {
                return {
                    ok: true,
                    status: response.status,
                    data: data  
                };
            } else {
                return {
                    ok: true,
                    status: response.status,
                    ...data
                };
            }
        }
        
    } catch (error) {
        console.error('Error en petición API:', error);
        return {
            ok: false,
            status: 0,
            error: error.message || 'Error de conexión con el servidor'
        };
    }
}
// Descargar un archivo (PDF, imagen, etc.) desde un blob
export function descargarArchivo(blob, nombreArchivo) {
    // Crear un enlace temporal
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
