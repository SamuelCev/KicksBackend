import { login } from "./utils/auth.js"; 
import { getSwalConfig } from "./utils/utilities.js";

// Obtener el formulario
const loginForm = document.getElementById('login-form');

// Manejar el submit del formulario
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  
  // Obtener los valores
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  
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
  }
});