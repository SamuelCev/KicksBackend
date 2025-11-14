// ============================================
// FORMULARIO DE CONTACTO
// ============================================

const form = document.getElementById('contacto-form');

// Event listener para el submit del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener datos del formulario
  const formData = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    asunto: document.getElementById('asunto').value,
    mensaje: document.getElementById('mensaje').value.trim()
  };

  // Validar que los campos requeridos estén llenos
  if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
    mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  // Validar formato de email
  if (!validarEmail(formData.email)) {
    mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
    return;
  }

  // Enviar formulario
  await enviarFormulario(formData);
});

/**
 * Función para enviar el formulario de contacto
 * @param {Object} datos - Datos del formulario
 */
async function enviarFormulario(datos) {
  const submitBtn = form.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const originalText = btnText.textContent;

  try {
    // Deshabilitar botón y cambiar texto
    submitBtn.disabled = true;
    btnText.textContent = 'Enviando...';

    // TODO: Implementar llamada al API del backend
    // const response = await fetch('/api/contacto', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(datos)
    // });

    // if (!response.ok) {
    //   throw new Error('Error al enviar el mensaje');
    // }

    // Simulación de envío (remover cuando se implemente el API real)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mensaje de éxito
    mostrarMensaje('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
    
    // Limpiar formulario
    form.reset();

    // Log para desarrollo
    console.log('Datos del formulario de contacto:', datos);

  } catch (error) {
    console.error('Error al enviar formulario:', error);
    mostrarMensaje('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.', 'error');
  } finally {
    // Rehabilitar botón y restaurar texto
    submitBtn.disabled = false;
    btnText.textContent = originalText;
  }
}

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Mostrar mensaje de éxito o error
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - 'success' o 'error'
 */
function mostrarMensaje(mensaje, tipo) {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.querySelector('.form-message');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }

  // Crear nuevo mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = `form-message form-message--${tipo}`;
  
  const icon = tipo === 'success' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <polyline points="20 6 9 17 4 12"></polyline>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <circle cx="12" cy="12" r="10"></circle>
         <line x1="15" y1="9" x2="9" y2="15"></line>
         <line x1="9" y1="9" x2="15" y2="15"></line>
       </svg>`;
  
  mensajeDiv.innerHTML = `${icon}<span>${mensaje}</span>`;
  
  // Insertar antes del formulario
  form.parentNode.insertBefore(mensajeDiv, form);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    mensajeDiv.style.opacity = '0';
    mensajeDiv.style.transition = 'opacity 0.3s ease';
    setTimeout(() => mensajeDiv.remove(), 300);
  }, 5000);

  // Scroll suave hacia el mensaje
  mensajeDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================

// Validar email mientras el usuario escribe
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
  if (emailInput.value && !validarEmail(emailInput.value)) {
    emailInput.style.borderColor = 'var(--color-acento)';
  } else {
    emailInput.style.borderColor = '';
  }
});

// Limpiar estilo al volver a escribir
emailInput.addEventListener('input', () => {
  emailInput.style.borderColor = '';
});
