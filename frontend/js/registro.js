import { register, redirectIfAuthenticated } from "./utils/auth.js"; 
import { getSwalConfig } from "./utils/utilities.js";

await redirectIfAuthenticated();

// Obtener el formulario
const registroForm = document.getElementById('registro-form');

// Manejar el submit del formulario
registroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener los valores
  const nombre = document.getElementById('nombre');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');

  if (password.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Las contraseñas no coinciden. Intenta de nuevo.',
      ...getSwalConfig()
    });
    return;
  }
  
    
  try {
    const resultado = await register(nombre.value, email.value, password.value, confirmPassword.value);
  
    if (resultado.success) {
      // Login exitoso
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada Exitosamente!',
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
        title: 'Error de registro',
        text: resultado.error || 'Error al registrar usuario',
        ...getSwalConfig()
      });
    }  
    nombre.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';

  } catch (error) {
    console.error('Error en el registro:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado. Intenta de nuevo.',
      ...getSwalConfig()
    });
  }
});

