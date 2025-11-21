// ============================================
// RECUPERAR.JS - Flujo de recuperación de contraseña
// ============================================

import { resetPasswordEmail, verifyCode, resetPassword } from './utils/auth.js';

// ============================================
// MANEJO DE ESTADO CON SESSION STORAGE
// ============================================

const STORAGE_KEY = 'kicks_recovery_state';

// Estado inicial
let recoveryState = {
  step: 1,
  email: '',
  codeVerified: false,
  resetToken: ''
};

// Cargar estado al iniciar
function loadState() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      recoveryState = JSON.parse(saved);
      showStep(recoveryState.step);
      
      // Restaurar email en display si estamos en paso 2 o 3
      if (recoveryState.step >= 2 && recoveryState.email) {
        document.getElementById('email-display').textContent = recoveryState.email;
      }
      
      // Si estamos en paso 3 pero no hay token válido, volver al inicio
      if (recoveryState.step === 3 && !recoveryState.resetToken) {
        clearState();
        showStep(1);
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
      clearState();
    }
  }
}

// Guardar estado
function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recoveryState));
}

// Limpiar estado (al completar o cancelar)
function clearState() {
  sessionStorage.removeItem(STORAGE_KEY);
  recoveryState = { 
    step: 1, 
    email: '', 
    codeVerified: false, 
    resetToken: '' 
  };
}

// Limpiar todos los inputs
function clearAllInputs() {
  document.getElementById('email').value = '';
  document.getElementById('code').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  
  // Remover hints de contraseña si existen
  document.querySelectorAll('.password-hint').forEach(hint => hint.remove());
}

// ============================================
// NAVEGACIÓN ENTRE PASOS
// ============================================

function showStep(stepNumber) {
  // Ocultar todos los pasos
  document.querySelectorAll('.recovery-step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Mostrar el paso actual
  const currentStep = document.getElementById(`step-${stepNumber}`);
  if (currentStep) {
    currentStep.classList.add('active');
  }
  
  // Actualizar estado
  recoveryState.step = stepNumber;
  saveState();
}

// ============================================
// PASO 1: SOLICITAR CÓDIGO
// ============================================

document.getElementById('form-email').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  
  if (!email) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor ingresa tu correo electrónico'
    });
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await Swal.fire({
      icon: 'error',
      title: 'Email inválido',
      text: 'Por favor ingresa un correo electrónico válido'
    });
    return;
  }
  
  // Mostrar loading
  Swal.fire({
    title: 'Enviando código...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Llamar a la API
    const result = await resetPasswordEmail(email);
    
    if (result.success) {
      // Guardar email
      recoveryState.email = email;
      saveState();
      
      // Mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Código enviado!',
        html: `
          <p>Hemos enviado un código de verificación a:</p>
          <p style="font-weight: 600; color: var(--color-acento);">${email}</p>
          <p style="margin-top: 16px; font-size: 0.9rem; color: var(--color-secundario);">
            Revisa tu bandeja de entrada y spam. El código expira en 15 minutos.
          </p>
        `,
        confirmButtonText: 'Continuar'
      });
      
      // Actualizar display del email
      document.getElementById('email-display').textContent = email;
      
      // Limpiar input del código
      document.getElementById('code').value = '';
      
      // Ir al paso 2
      showStep(2);
      
      // Focus en el input del código
      setTimeout(() => {
        document.getElementById('code').focus();
      }, 100);
      
    } else {
      throw new Error(result.error || 'Error al enviar el código');
    }
    
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo enviar el código. Por favor, intenta de nuevo.'
    });
  }
});

// ============================================
// PASO 2: VERIFICAR CÓDIGO
// ============================================

document.getElementById('form-code').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const codeInput = document.getElementById('code');
  const code = codeInput.value.trim();
  
  // Validar código
  if (!code) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor ingresa el código de verificación'
    });
    return;
  }
  
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    await Swal.fire({
      icon: 'error',
      title: 'Código inválido',
      text: 'El código debe tener exactamente 6 dígitos numéricos'
    });
    return;
  }
  
  // Verificar que tenemos el email
  if (!recoveryState.email) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Sesión inválida. Por favor, comienza de nuevo.'
    });
    clearState();
    clearAllInputs();
    showStep(1);
    return;
  }
  
  // Mostrar loading
  Swal.fire({
    title: 'Verificando código...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Llamar a la API
    const result = await verifyCode(recoveryState.email, code);
    
    if (result.success && result.resetToken) {
      // Guardar el resetToken
      recoveryState.codeVerified = true;
      recoveryState.resetToken = result.resetToken;
      saveState();
      
      // Mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Código verificado!',
        text: 'Ahora puedes establecer tu nueva contraseña',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Limpiar input del código
      codeInput.value = '';
      
      // Limpiar inputs de contraseña
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
      
      // Ir al paso 3
      showStep(3);
      
      // Focus en el input de nueva contraseña
      setTimeout(() => {
        document.getElementById('new-password').focus();
      }, 100);
      
    } else {
      throw new Error(result.error || 'Código inválido o expirado');
    }
    
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Código incorrecto',
      text: error.message || 'El código ingresado es inválido o ha expirado. Verifica e intenta de nuevo.'
    });
    
    // Limpiar y hacer focus para reintentar
    codeInput.value = '';
    codeInput.focus();
  }
});

// ============================================
// REENVIAR CÓDIGO
// ============================================

document.getElementById('resend-code').addEventListener('click', async () => {
  if (!recoveryState.email) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No hay email registrado. Por favor, comienza de nuevo.'
    });
    clearState();
    clearAllInputs();
    showStep(1);
    return;
  }
  
  const result = await Swal.fire({
    title: '¿Reenviar código?',
    html: `Se enviará un nuevo código a:<br><strong>${recoveryState.email}</strong>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, reenviar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#D01110',
    cancelButtonColor: '#545454'
  });
  
  if (!result.isConfirmed) return;
  
  // Mostrar loading
  Swal.fire({
    title: 'Reenviando código...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Reutilizar el mismo método del paso 1
    const response = await resetPasswordEmail(recoveryState.email);
    
    if (response.success) {
      await Swal.fire({
        icon: 'success',
        title: '¡Código reenviado!',
        text: 'Revisa tu correo electrónico. El nuevo código expira en 15 minutos.',
        timer: 3000,
        showConfirmButton: false
      });
      
      // Limpiar el input del código
      document.getElementById('code').value = '';
      document.getElementById('code').focus();
      
    } else {
      throw new Error(response.error || 'Error al reenviar el código');
    }
    
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo reenviar el código. Por favor, intenta de nuevo.'
    });
  }
});

// ============================================
// CAMBIAR EMAIL
// ============================================

document.getElementById('change-email').addEventListener('click', async () => {
  const result = await Swal.fire({
    title: '¿Usar otro correo?',
    text: 'Perderás el progreso actual y tendrás que solicitar un nuevo código',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#D01110',
    cancelButtonColor: '#545454'
  });
  
  if (result.isConfirmed) {
    // Limpiar todo
    clearState();
    clearAllInputs();
    
    // Volver al paso 1
    showStep(1);
    
    // Focus en email
    setTimeout(() => {
      document.getElementById('email').focus();
    }, 100);
    
    await Swal.fire({
      icon: 'success',
      title: 'Listo',
      text: 'Puedes ingresar un nuevo correo electrónico',
      timer: 1500,
      showConfirmButton: false
    });
  }
});

// ============================================
// PASO 3: NUEVA CONTRASEÑA
// ============================================

document.getElementById('form-password').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // Validaciones
  if (!newPassword || !confirmPassword) {
    await Swal.fire({
      icon: 'error',
      title: 'Campos vacíos',
      text: 'Por favor completa ambos campos de contraseña'
    });
    return;
  }
  
  if (newPassword.length < 8) {
    await Swal.fire({
      icon: 'error',
      title: 'Contraseña muy corta',
      text: 'La contraseña debe tener al menos 8 caracteres'
    });
    newPasswordInput.focus();
    return;
  }
  
  if (newPassword !== confirmPassword) {
    await Swal.fire({
      icon: 'error',
      title: 'Las contraseñas no coinciden',
      text: 'Por favor verifica que ambas contraseñas sean iguales'
    });
    confirmPasswordInput.value = '';
    confirmPasswordInput.focus();
    return;
  }
  
  // Verificar que tengamos el resetToken
  if (!recoveryState.resetToken || !recoveryState.codeVerified) {
    await Swal.fire({
      icon: 'error',
      title: 'Error de seguridad',
      text: 'Sesión inválida. Debes verificar el código antes de cambiar la contraseña.'
    });
    clearState();
    clearAllInputs();
    showStep(1);
    return;
  }
  
  // Mostrar loading
  Swal.fire({
    title: 'Actualizando contraseña...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Llamar a la API
    const result = await resetPassword(recoveryState.resetToken, newPassword);
    
    if (result.success) {
      // Limpiar estado y campos completamente
      clearState();
      clearAllInputs();
      
      // Mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        html: `
          <p>Tu contraseña ha sido cambiada exitosamente.</p>
          <p style="margin-top: 12px;">Serás redirigido al inicio de sesión.</p>
        `,
        confirmButtonText: 'Ir a iniciar sesión',
        allowOutsideClick: false
      });
      
      // Redirigir al login
      window.location.href = 'login.html';
      
    } else {
      throw new Error(result.error || 'Error al actualizar la contraseña');
    }
    
  } catch (error) {
    const errorMessage = error.message || 'No se pudo actualizar la contraseña. Por favor, intenta de nuevo.';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage
    });
    
    // Si el token expiró, volver al inicio
    if (errorMessage.includes('expiró') || 
        errorMessage.includes('expired') || 
        errorMessage.includes('inválido') ||
        errorMessage.includes('invalid')) {
      
      await Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Deberás solicitar un nuevo código.',
        confirmButtonText: 'Entendido'
      });
      
      clearState();
      clearAllInputs();
      showStep(1);
    } else {
      // Si es otro error, limpiar solo los campos de contraseña
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      newPasswordInput.focus();
    }
  }
});

// ============================================
// VALIDACIÓN DE SEGURIDAD AL CARGAR
// ============================================

function validateStepAccess() {
  // Si estamos en paso 3 pero no hay token válido
  if (recoveryState.step === 3 && !recoveryState.resetToken) {
    console.warn('Acceso no autorizado al paso 3 sin token válido');
    clearState();
    clearAllInputs();
    showStep(1);
  }
  
  // Si estamos en paso 2 pero no hay email
  if (recoveryState.step === 2 && !recoveryState.email) {
    console.warn('Acceso no autorizado al paso 2 sin email');
    clearState();
    clearAllInputs();
    showStep(1);
  }
}

// ============================================
// MEJORAS DE UX
// ============================================

// Permitir solo números en el input del código
document.getElementById('code').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

// Enter en el código para enviar automáticamente
document.getElementById('code').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('form-code').dispatchEvent(new Event('submit'));
  }
});

// Detectar cuando el usuario pega el código
document.getElementById('code').addEventListener('paste', (e) => {
  setTimeout(() => {
    const pastedValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    e.target.value = pastedValue;
    
    // Si se pegó un código de 6 dígitos, auto-submit después de un breve delay
    if (pastedValue.length === 6) {
      setTimeout(() => {
        document.getElementById('form-code').dispatchEvent(new Event('submit'));
      }, 500);
    }
  }, 10);
});

// Mostrar hint de caracteres mientras escribe la contraseña
function setupPasswordToggles() {
  const passwords = ['new-password', 'confirm-password'];
  
  passwords.forEach(id => {
    const input = document.getElementById(id);
    
    input.addEventListener('input', () => {
      const value = input.value;
      const parent = input.closest('.form-group');
      
      // Remover hint previo si existe
      let hint = parent.querySelector('.password-hint');
      if (hint) hint.remove();
      
      // Mostrar hint solo en el primer campo mientras escribe
      if (id === 'new-password' && value.length > 0 && value.length < 8) {
        hint = document.createElement('small');
        hint.className = 'password-hint';
        hint.textContent = `${value.length}/8 caracteres mínimos`;
        parent.appendChild(hint);
      }
    });
    
    // Limpiar hint cuando el campo pierde el foco
    input.addEventListener('blur', () => {
      const parent = input.closest('.form-group');
      const hint = parent.querySelector('.password-hint');
      if (hint && input.value.length >= 8) {
        hint.remove();
      }
    });
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Cargar estado guardado
  loadState();
  
  // Validar acceso a los pasos
  validateStepAccess();
  
  // Setup de mejoras UX
  setupPasswordToggles();
  
  console.log('Sistema de recuperación de contraseña inicializado');
});

// Limpiar estado si el usuario cierra la ventana/pestaña
window.addEventListener('beforeunload', () => {
  // Solo mantener el estado si está en proceso (no completado)
  if (recoveryState.step < 3) {
    saveState();
  }
});