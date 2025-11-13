// Obtener el formulario
const loginForm = document.getElementById('login-form');

// Manejar el submit del formulario
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener los valores
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // Aquí irá tu lógica para llamar al API
  console.log('Datos del login:', { email, password, remember });
  
  try {
    // TODO: Hacer fetch a tu API
    // const response = await fetch('http://tu-api.com/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    
    // Por ahora simulamos un login exitoso
    alert('Login exitoso! (Aquí conectarás con tu API)');
    
    // Redirigir al home o dashboard
    // window.location.href = '../index.html';
    
  } catch (error) {
    console.error('Error en el login:', error);
    alert('Error al iniciar sesión. Intenta de nuevo.');
  }
});