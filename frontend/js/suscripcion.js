import { aiChatIcon, trashIcon } from './utils/icons.js';
import '../js/utils/chat.js'

import { suscribirseNewsletter } from './utils/auth.js';

document.getElementById('chatFabIcon').innerHTML = aiChatIcon;
document.getElementById('chatHeaderIcon').innerHTML = aiChatIcon;
document.getElementById('clearChat').innerHTML = trashIcon;
const form = document.getElementById('suscripcion-form');
const emailInput = document.getElementById('email');

// Event listener para el submit del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();

  // Validar email
  if (!email) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'Por favor ingresa tu correo electrónico',
      confirmButtonColor: '#D01110'
    });
    return;
  }

  if (!validarEmail(email)) {
    Swal.fire({
      icon: 'error',
      title: 'Email inválido',
      text: 'Por favor ingresa un correo electrónico válido',
      confirmButtonColor: '#D01110'
    });
    return;
  }

  // Enviar suscripción
  await procesarSuscripcion(email);
});

/**
 * Procesar la suscripción al newsletter
 * @param {string} email - Email del usuario
 */
async function procesarSuscripcion(email) {
  const submitBtn = form.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const originalText = btnText.textContent;

  try {
    // Deshabilitar botón y cambiar texto
    submitBtn.disabled = true;
    btnText.textContent = 'Suscribiendo...';

    // Llamar a la API
    const resultado = await suscribirseNewsletter(email);

    if (resultado.success) {
      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido a la familia KICKS!',
        html: `
          <p>Te has suscrito exitosamente a nuestro newsletter.</p>
          <p>Pronto recibirás nuestras mejores ofertas y novedades en <strong>${email}</strong></p>
        `,
        confirmButtonColor: '#D01110',
        confirmButtonText: 'Genial!'
      });

      // Limpiar formulario
      form.reset();

      // Opcional: Redirigir al home después de unos segundos
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);

    } else {
      // Mostrar error
      throw new Error(resultado.error || 'Error al procesar la suscripción');
    }

  } catch (error) {
    console.error('Error en suscripción:', error);
    
    // Verificar si el error es por email ya registrado
    const mensajeError = error.message.toLowerCase();
    if (mensajeError.includes('ya existe') || mensajeError.includes('registrado')) {
      Swal.fire({
        icon: 'info',
        title: 'Ya estás suscrito',
        text: 'Este correo ya está registrado en nuestro newsletter',
        confirmButtonColor: '#D01110'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error al suscribirse',
        text: error.message || 'Hubo un problema al procesar tu suscripción. Por favor intenta de nuevo.',
        confirmButtonColor: '#D01110'
      });
    }

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

// Validar email al perder el foco
emailInput.addEventListener('blur', () => {
  if (emailInput.value && !validarEmail(emailInput.value)) {
    emailInput.style.borderColor = 'var(--color-acento)';
  } else {
    emailInput.style.borderColor = '';
  }
});

// Limpiar estilo al escribir
emailInput.addEventListener('input', () => {
  emailInput.style.borderColor = '';
});

// ============================================
// ANIMACIÓN DE ENTRADA
// ============================================

// Animar los beneficios uno por uno
document.addEventListener('DOMContentLoaded', () => {
  const beneficios = document.querySelectorAll('.beneficio-item');
  
  beneficios.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'all 0.4s ease';
      
      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      });
    }, 100 * index);
  });
});