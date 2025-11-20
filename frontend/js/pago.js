import { getSwalConfig, obtenerUrlImagen } from './utils/utilities.js';
import { 
    getCart, 
    getPaises, 
    getOxxoDetails, 
    getInfoTransferencia,
    createOrder,
    protectPage,
    verifyCoupon
} from './utils/auth.js';
import { API_URL } from './utils/config.js';

// ============================================
// Variables Globales
// ============================================
let carritoItems = [];
let paisesDisponibles = [];
let paisSeleccionado = null;
let cuponAplicado = null;
let descuentoCupon = 0;


// ============================================
// Funciones de Carga de Datos
// ============================================

/**
 * Cargar países disponibles
 */
async function cargarPaises() {
    try {
        const result = await getPaises();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        paisesDisponibles = result.paises;
        
        const select = document.getElementById('pais');
        select.innerHTML = '<option value="">Selecciona tu país</option>';
        
        paisesDisponibles.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais.codigo;
            option.textContent = pais.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar países:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los países',
            ...getSwalConfig()
        });
    }
}

/**
 * Cargar items del carrito
 */
async function cargarCarrito() {
    try {
        const result = await getCart();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        carritoItems = result.cart;
        
        if (carritoItems.length === 0) {
            window.location.href = 'carrito.html';
            return;
        }
        
        renderizarItems();
        calcularTotales();
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el carrito',
            ...getSwalConfig()
        }).then(() => {
            window.location.href = 'carrito.html';
        });
    }
}

// ============================================
// Funciones de Renderizado
// ============================================

/**
 * Renderizar items del carrito
 */
function renderizarItems() {
    const container = document.getElementById('order-items');
    
    const html = carritoItems.map(item => {
        const precio = parseFloat(item.info_producto.precio);
        const subtotal = precio * item.cantidad;
        const imagenUrl = obtenerUrlImagen(item.info_producto.imagen);
        
        return `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${imagenUrl}" alt="${item.info_producto.nombre}">
                </div>
                <div class="order-item-details">
                    <p class="order-item-name">${item.info_producto.nombre}</p>
                    <p class="order-item-quantity">Cantidad: ${item.cantidad}</p>
                    <p class="order-item-price">$${subtotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

/**
 * Calcular totales
 */
function calcularTotales() {
    const subtotal = carritoItems.reduce((total, item) => {
        const precio = parseFloat(item.info_producto.precio);
        return total + (precio * item.cantidad);
    }, 0);
    
    let envio = 0;
    let impuestos = 0;
    
    if (paisSeleccionado) {
        envio = parseFloat(paisSeleccionado.gasto_envio) || 0;
        impuestos = subtotal * (parseFloat(paisSeleccionado.impuesto) || 0);
    }
    
    const descuento = subtotal * descuentoCupon;
    const subtotalConDescuento = subtotal - descuento;
    
    impuestos = subtotalConDescuento * (parseFloat(paisSeleccionado?.impuesto) || 0);
    
    const total = subtotalConDescuento + envio + impuestos;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = `$${envio.toFixed(2)}`;
    document.getElementById('impuestos').textContent = `$${impuestos.toFixed(2)}`;
    
    const summaryDetails = document.querySelector('.summary-details');
    let descuentoRow = document.getElementById('descuento-row');
    
    if (descuentoCupon > 0) {
        if (!descuentoRow) {
            descuentoRow = document.createElement('div');
            descuentoRow.id = 'descuento-row';
            descuentoRow.className = 'summary-row';
            descuentoRow.style.color = '#4CAF50';
            
            // Insertar antes de la fila de total
            const totalRow = summaryDetails.querySelector('.summary-row.total');
            summaryDetails.insertBefore(descuentoRow, totalRow);
        }
        descuentoRow.innerHTML = `
            <span>Descuento (${cuponAplicado})</span>
            <span>-$${descuento.toFixed(2)}</span>
        `;
    } else if (descuentoRow) {
        descuentoRow.remove();
    }
    
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// ============================================
// Manejadores de Eventos
// ============================================

/**
 * Manejar cambio de país
 */
function handlePaisChange(event) {
    const codigoPais = event.target.value;
    paisSeleccionado = paisesDisponibles.find(p => p.codigo === codigoPais);
    calcularTotales();
}

/**
 * Manejar cambio de método de pago
 */
function handleMetodoPagoChange(event) {
    // Ocultar todos los formularios
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Mostrar el formulario correspondiente
    const metodo = event.target.value;
    const formId = metodo === 'tarjeta' ? 'card-form' : 
                   metodo === 'oxxo' ? 'oxxo-info' : 'transfer-info';
    
    const form = document.getElementById(formId);
    if (form) {
        form.classList.add('active');
    }
}

/**
 * Formatear número de tarjeta
 */
function formatearNumeroTarjeta(event) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    event.target.value = formattedValue;
}

/**
 * Formatear fecha de expiración
 */
function formatearFechaExpiracion(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    event.target.value = value;
}

// ============================================
// Validaciones
// ============================================

/**
 * Validar formulario de tarjeta
 */
function validarDatosTarjeta() {
    const numero = document.getElementById('card_number').value.replace(/\s/g, '');
    const nombre = document.getElementById('card_name').value.trim();
    const expiry = document.getElementById('card_expiry').value;
    const cvv = document.getElementById('card_cvv').value;
    
    if (numero.length < 13 || numero.length > 19) {
        throw new Error('Número de tarjeta inválido');
    }
    
    if (nombre.length < 3) {
        throw new Error('Nombre en la tarjeta inválido');
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        throw new Error('Fecha de expiración inválida (MM/AA)');
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
        throw new Error('CVV inválido');
    }
    
    return {
        numero_tarjeta: numero,
        nombre_tarjeta: nombre,
        fecha_expiracion: expiry,
        cvv: cvv
    };
}

// ============================================
// Procesamiento de Pedido
// ============================================

/**
 * Confirmar pedido
 */
async function confirmarPedido() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Validar campos obligatorios
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const metodo_pago = formData.get('metodo_pago');
    
    // Preparar datos de la orden
    const ordenData = {
        metodo_pago: metodo_pago,
        nombre_envio: formData.get('nombre_envio'),
        direccion_envio: formData.get('direccion_envio'),
        ciudad: formData.get('ciudad'),
        codigo_postal: formData.get('codigo_postal'),
        telefono: formData.get('telefono'),
        pais: formData.get('pais'),
        cupon: formData.get('cupon') || undefined
    };
    
    // Si es pago con tarjeta, agregar datos de pago
    if (metodo_pago === 'tarjeta') {
        try {
            ordenData.datos_pago = validarDatosTarjeta();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en datos de tarjeta',
                text: error.message,
                ...getSwalConfig()
            });
            return;
        }
    }
    
    // Deshabilitar botón
    const btn = document.getElementById('btn-confirmar-pago');
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    try {
        const result = await createOrder(ordenData);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Manejar respuesta según método de pago
        if (metodo_pago === 'oxxo') {
            await mostrarReferenciaOXXO();
        } else if (metodo_pago === 'transferencia') {
            await mostrarDatosTransferencia();
        } else {
            await mostrarConfirmacionTarjeta(result.orderId);
        }
        
    } catch (error) {
        console.error('Error al procesar pedido:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pedido',
            text: error.message,
            ...getSwalConfig()
        });
        btn.disabled = false;
        btn.textContent = 'Confirmar Pedido';
    }
}

// ============================================
// Confirmaciones de Pago
// ============================================

/**
 * Mostrar referencia OXXO
 */
async function mostrarReferenciaOXXO() {
    try {
        const result = await getOxxoDetails();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        await Swal.fire({
            icon: 'success',
            title: '¡Pedido confirmado!',
            html: `
                <div style="padding: 20px; text-align: left;">
                    <p style="margin-bottom: 15px;">Tu pedido ha sido registrado exitosamente.</p>
                    <p style="margin-bottom: 15px;"><strong>Referencia OXXO:</strong></p>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--color-acento); text-align: center; padding: 15px; background: rgba(208,17,16,0.1); border-radius: 8px;">${result.referencia}</p>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: var(--color-secundario);">Presenta esta referencia en cualquier tienda OXXO para completar tu pago.</p>
                </div>
            `,
            confirmButtonText: 'Entendido',
            ...getSwalConfig()
        });
        
        window.location.href = 'productos.html';
    } catch (error) {
        console.error('Error al obtener referencia OXXO:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener la referencia OXXO',
            ...getSwalConfig()
        });
    }
}

/**
 * Mostrar datos de transferencia
 */
async function mostrarDatosTransferencia() {
    try {
        const result = await getInfoTransferencia();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        const data = result.info;
        
        await Swal.fire({
            icon: 'success',
            title: '¡Pedido confirmado!',
            html: `
                <div style="padding: 20px; text-align: left;">
                    <p style="margin-bottom: 15px;">Tu pedido ha sido registrado exitosamente.</p>
                    <p style="margin-bottom: 10px;"><strong>Datos para transferencia:</strong></p>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Banco:</strong> ${data.banco}</li>
                        <li style="margin-bottom: 8px;"><strong>CLABE:</strong> ${data.clabe}</li>
                        <li style="margin-bottom: 8px;"><strong>Titular:</strong> ${data.titular}</li>
                        <li style="margin-bottom: 8px;"><strong>Referencia:</strong> ${data.referencia}</li>
                    </ul>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: var(--color-secundario);">Realiza la transferencia con estos datos y tu pedido será procesado en 24-48 horas.</p>
                </div>
            `,
            confirmButtonText: 'Entendido',
            width: 600,
            ...getSwalConfig()
        });
        
        window.location.href = 'productos.html';
    } catch (error) {
        console.error('Error al obtener datos de transferencia:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron obtener los datos de transferencia',
            ...getSwalConfig()
        });
    }
}

/**
 * Mostrar confirmación de pago con tarjeta
 */
async function mostrarConfirmacionTarjeta(orderId) {
    await Swal.fire({
        icon: 'success',
        title: '¡Pago procesado exitosamente!',
        html: `
            <div style="padding: 20px;">
                <p style="margin-bottom: 15px;">Tu pedido ha sido confirmado y el pago ha sido procesado.</p>
                <p><strong>Número de orden:</strong> #${orderId}</p>
                <p style="margin-top: 15px; font-size: 0.9rem; color: var(--color-secundario);">Recibirás un correo con los detalles de tu compra.</p>
            </div>
        `,
        confirmButtonText: 'Continuar comprando',
        ...getSwalConfig()
    });
    
    window.location.href = 'productos.html';
}

// Validar y aplicar cupon de descuento
async function validarCupon() {
    const inputCupon = document.getElementById('cupon');
    const codigoCupon = inputCupon.value.trim().toUpperCase();
    const mensaje = document.getElementById('cupon-mensaje');
    const btn = document.getElementById('btn-validar-cupon');

    if (!codigoCupon) {
        mensaje.style.color = 'var(--color-rojo)';
        mensaje.textContent = 'Ingresa un codigo de cupon';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Validando...';
    mensaje.textContent = '';

    try {
        const result = await verifyCoupon(codigoCupon);

        if (result.success && result.descuento) {
            cuponAplicado = codigoCupon;
            descuentoCupon = parseFloat(result.descuento);

            mensaje.style.color = '#4CAF50';
            mensaje.textContent = `✓ Cupón aplicado: ${(descuentoCupon * 100).toFixed(0)}% de descuento`;

            btn.textContent = 'Aplicado';
            inputCupon.disabled = true;

            calcularTotales();

            Swal.fire({
                icon: 'success',
                title: '¡Cupón aplicado!',
                text: `Has obtenido ${(descuentoCupon * 100).toFixed(0)}% de descuento`,
                timer: 2000,
                showConfirmButton: false,
                ...getSwalConfig()
            });
        } else {
            throw new Error(result.error || 'Cupon Invalido');
        }
    } catch (error) {
        mensaje.style.color = 'var(--color-error)';
        mensaje.textContent = `✗ ${error.message}`;
        
        btn.disabled = false;
        btn.textContent = 'Aplicar';
        
        cuponAplicado = null;
        descuentoCupon = 0;
        calcularTotales();
    }
}

// ============================================
// Inicialización
// ============================================

/**
 * Inicializar eventos y cargar datos
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar datos iniciales
    await protectPage();
    await cargarPaises();
    await cargarCarrito();
    
    // Event listeners - País
    const paisSelect = document.getElementById('pais');
    if (paisSelect) {
        paisSelect.addEventListener('change', handlePaisChange);
    }
    
    // Event listeners - Método de pago
    document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
        radio.addEventListener('change', handleMetodoPagoChange);
    });
    
    // Event listeners - Formateo de tarjeta
    const cardNumber = document.getElementById('card_number');
    if (cardNumber) {
        cardNumber.addEventListener('input', formatearNumeroTarjeta);
    }
    
    const cardExpiry = document.getElementById('card_expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', formatearFechaExpiracion);
    }
    
    // Event listener - Solo números en CVV
    const cardCvv = document.getElementById('card_cvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Event listener - Botón confirmar pedido
    const btnConfirmar = document.getElementById('btn-confirmar-pago');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarPedido);
    }

    const btnValidarCupon = document.getElementById('btn-validar-cupon');
    if (btnValidarCupon) {
        btnValidarCupon.addEventListener('click', validarCupon);
    }
    
    const inputCupon = document.getElementById('cupon');
    if (inputCupon) {
        inputCupon.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                validarCupon();
            }
        });
    }
});