const { generarReciboPDF } = require('./generadorRecibos');

async function testGenerarRecibo() {
  console.log('Iniciando prueba de generación de recibo PDF...\n');

  // Datos de prueba para el recibo
  const datosRecibo = {
    fecha: new Date(),
    nombreCliente: "Juan Pérez García",
    articulos: [
      { 
        nombre: "Nike Air Max 270", 
        precioUnitario: 2499.99, 
        cantidad: 1 
      },
      { 
        nombre: "Adidas Superstar Classic", 
        precioUnitario: 1899.00, 
        cantidad: 2 
      },
      { 
        nombre: "Puma RS-X Running", 
        precioUnitario: 1599.50, 
        cantidad: 1 
      }
    ],
    subtotal: 7897.49,
    impuestos: 1263.60,
    gastosEnvio: 150.00,
    nombreCupon: "DESCUENTO20",
    porcentajeDescuento: 20,
    total: 7731.69
  };

  try {
    console.log('Datos del recibo:');
    console.log('- Cliente:', datosRecibo.nombreCliente);
    console.log('- Fecha:', datosRecibo.fecha.toLocaleDateString('es-MX'));
    console.log('- Artículos:', datosRecibo.articulos.length);
    console.log('- Total:', `$${datosRecibo.total.toFixed(2)}`);
    console.log('\nGenerando PDF...\n');

    const pdfPath = await generarReciboPDF(datosRecibo);
    
    console.log('✅ Recibo generado exitosamente!');
    console.log('📄 Archivo:', pdfPath);
    console.log('\n--- Prueba sin cupón de descuento ---\n');

    // Prueba sin cupón de descuento
    const datosSinCupon = {
      fecha: new Date(),
      nombreCliente: "María López Rodríguez",
      articulos: [
        { 
          nombre: "Converse Chuck Taylor All Star", 
          precioUnitario: 1299.00, 
          cantidad: 2 
        }
      ],
      subtotal: 2598.00,
      impuestos: 415.68,
      gastosEnvio: 120.00,
      nombreCupon: null,
      porcentajeDescuento: 0,
      total: 3133.68
    };

    console.log('Datos del recibo:');
    console.log('- Cliente:', datosSinCupon.nombreCliente);
    console.log('- Artículos:', datosSinCupon.articulos.length);
    console.log('- Total:', `$${datosSinCupon.total.toFixed(2)}`);
    console.log('\nGenerando PDF sin cupón...\n');

    const pdfPath2 = await generarReciboPDF(datosSinCupon);
    
    console.log('✅ Recibo sin cupón generado exitosamente!');
    console.log('📄 Archivo:', pdfPath2);
    console.log('\n🎉 Todas las pruebas completadas con éxito!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testGenerarRecibo().then(() => {
  console.log('\n✨ Script de prueba finalizado.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
