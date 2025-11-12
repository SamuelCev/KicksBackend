// Obtener el formulario
const registroForm = document.getElementById('registro-form');

// Manejar el submit del formulario
registroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener los valores
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Aquí irá tu lógica para llamar al API
  console.log('Datos del registro:', { nombre, email, password, confirmPassword });
  
  try {
    // TODO: Hacer fetch a tu API
    // const response = await fetch('http://tu-api.com/registro', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ nombre, email, password })
    // });
    
    // Por ahora simulamos un registro exitoso
    alert('Registro exitoso! (Aquí conectarás con tu API)');
    
    // Redirigir al login o dashboard
    // window.location.href = 'login.html';
    
  } catch (error) {
    console.error('Error en el registro:', error);
    alert('Error al registrarse. Intenta de nuevo.');
  }
});

