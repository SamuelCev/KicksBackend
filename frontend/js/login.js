import { login, redirectIfAuthenticated, generateCaptcha, validateCaptcha } from "./utils/auth.js"; 
import { getSwalConfig } from "./utils/utilities.js";

await redirectIfAuthenticated(); 

let currentCaptchaId = null;

async function loadCaptcha() {
  const captchaResult = await generateCaptcha();
  
  if (captchaResult.success) {
    currentCaptchaId = captchaResult.captchaId;
    
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(captchaResult.image)}`;
    document.getElementById('captcha-image').src = svgDataUrl;
    
    document.getElementById('captcha-answer').value = '';
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el CAPTCHA',
      ...getSwalConfig()
    });
  }
}

await loadCaptcha();

document.getElementById('refresh-captcha').addEventListener('click', loadCaptcha);

// Obtener el formulario
const loginForm = document.getElementById('login-form');

// Manejar el submit del formulario
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  
  // Obtener los valores
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const captchaAnswer = document.getElementById('captcha-answer').value;
  
  // Validación básica
  if (!email || !password) {
    Swal.fire({
      icon: 'error',
      title: 'Campos vacíos',
      text: 'Por favor ingresa tu email y contraseña',
      ...getSwalConfig()
    });
    return;
  }
  if (!captchaAnswer) {
    Swal.fire({
      icon: 'warning',
      title: 'CAPTCHA requerido',
      text: 'Por favor completa el CAPTCHA',
      ...getSwalConfig()
    });
    return;
  }
  
  const captchaResult = await validateCaptcha(currentCaptchaId, captchaAnswer);

  if (!captchaResult.success || !captchaResult.valid) {
    Swal.fire({
      icon: 'error',
      title: 'CAPTCHA incorrecto',
      text: 'El código ingresado no es válido',
      ...getSwalConfig()
    });
    await loadCaptcha(); 
    return;
  }

  try {
    const resultado = await login(email.value, password.value);
    
    
    if (resultado.success) {
      // Login exitoso
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${resultado.user.nombre}`,
        showConfirmButton: false,
        timer: 1500,
        ...getSwalConfig()
      });
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
      
    } else {
      // Login fallido
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: resultado.error || 'Credenciales incorrectas',
        ...getSwalConfig()
      });
      await loadCaptcha();
    }
    email.value = '';
    password.value = '';
    
  } catch (error) {
    console.error('Error en el login:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado. Intenta de nuevo.',
      ...getSwalConfig()
    });
    await loadCaptcha();
  }
});