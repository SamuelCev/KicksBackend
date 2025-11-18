// ============================================
// FORMULARIO DE CONTACTO
// ============================================

import { peticionAPI } from './utils/auth.js';
import { API_ENDPOINTS } from './utils/config.js';

const form = document.getElementById('contacto-form');

// Event listener para el submit del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener datos del formulario
  const formData = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    asunto: document.getElementById('asunto').value,
    mensaje: document.getElementById('mensaje').value.trim()
  };

  // Validar que los campos requeridos estén llenos
  if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
    Swal.fire({
      icon: 'error',
      title: 'Campos incompletos',
      text: 'Por favor completa todos los campos requeridos',
      confirmButtonColor: '#D01110'
    });
    return;
  }

  // Validar formato de email
  if (!validarEmail(formData.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Email inválido',
      text: 'Por favor ingresa un correo electrónico válido',
      confirmButtonColor: '#D01110'
    });
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

    // Llamada al API del backend
    const response = await peticionAPI(
      API_ENDPOINTS.CONTACT,
      'POST',
      datos
    );

    if (response.ok) {
      // Mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Mensaje enviado!',
        text: 'Nos pondremos en contacto contigo pronto.',
        confirmButtonColor: '#D01110'
      });
      
      // Limpiar formulario
      form.reset();
    } else {
      throw new Error(response.error || 'Error al enviar el mensaje');
    }

  } catch (error) {
    console.error('Error al enviar formulario:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al enviar',
      text: error.message || 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.',
      confirmButtonColor: '#D01110'
    });
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