const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generarReciboPDF(datosRecibo) {
  const {
    fecha,
    nombreCliente,
    articulos,
    subtotal,
    impuestos,
    gastosEnvio,
    nombreCupon = null,
    porcentajeDescuento = 0,
    total
  } = datosRecibo;

  // Formatear fecha
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generar filas de artículos
  const filasArticulos = articulos.map(articulo => {
    const totalArticulo = articulo.precioUnitario * articulo.cantidad;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${articulo.nombre}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${articulo.cantidad}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">$${articulo.precioUnitario.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">$${totalArticulo.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Ruta del logo y conversión a base64
  const logoPath = path.join(__dirname, '..', 'images', 'kicks_logo.png');
  const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  // HTML del recibo con diseño moderno basado en las imágenes
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo de Compra</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          background: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        
        .container {
          width: 100%;
          background: white;
        }
        
        .header {
          background: #505050ff;
          color: white;
          padding: 40px;
          text-align: center;
        }
        
        .header img.logo {
          width: 160px;
          height: 80px;
          margin-bottom: 15px;
        }
        
        .header h1 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .info-section {
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .info-block {
          flex: 1;
        }
        
        .info-block h3 {
          color: #D01110;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .info-block p {
          color: #374151;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .products-section {
          padding: 40px;
        }
        
        .products-section h2 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        thead {
          background: #f3f4f6;
        }
        
        th {
          padding: 12px;
          text-align: left;
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        th:nth-child(2),
        th:nth-child(3),
        th:nth-child(4) {
          text-align: right;
        }
        
        th:nth-child(2) {
          text-align: center;
        }
        
        td {
          color: #374151;
          font-size: 15px;
        }
        
        .summary {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        
        .summary-row.subtotal {
          color: #6b7280;
        }
        
        .summary-row.discount {
          color: #10b981;
          font-weight: 600;
        }
        
        .summary-row.discount .label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .coupon-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .summary-row.total {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          font-size: 22px;
          font-weight: 700;
          color: #D01110;
        }
        
        .footer {
          background: #f9fafb;
          padding: 30px 40px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 2px solid #e5e7eb;
        }
        
        .footer p {
          margin-bottom: 5px;
        }
        
        .thank-you {
          font-size: 18px;
          color: #D01110;
          font-weight: 600;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoDataUrl}" alt="KICKS Logo" class="logo">
          <h1>KICKS</h1>
          <p>Kickstart your future.</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>Cliente</h3>
            <p><strong>${nombreCliente}</strong></p>
          </div>
          <div class="info-block" style="text-align: right;">
            <h3>Fecha de Compra</h3>
            <p>${fechaFormateada}</p>
          </div>
        </div>
        
        <div class="products-section">
          <h2>Detalles de la Compra</h2>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filasArticulos}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row subtotal">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${nombreCupon && porcentajeDescuento > 0 ? `
            <div class="summary-row discount">
              <span class="label">
                Descuento
                <span class="coupon-badge">${nombreCupon}</span>
              </span>
              <span>-${porcentajeDescuento}% (-$${(subtotal * porcentajeDescuento / 100).toFixed(2)})</span>
            </div>
            ` : ''}
            <div class="summary-row subtotal">
              <span>Impuestos:</span>
              <span>$${impuestos.toFixed(2)}</span>
            </div>
            <div class="summary-row subtotal">
              <span>Gastos de Envío:</span>
              <span>$${gastosEnvio.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="thank-you">¡Gracias por tu compra!</p>
          <p>KICKS - Calzado de calidad que combina comodidad y diseño</p>
          <p>adminkicks@gmail.com | www.kicks.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Generar PDF con Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(__dirname, '..', 'Recibos', 'recibo.pdf');
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    console.log(`Recibo PDF generado exitosamente en: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { generarReciboPDF };
