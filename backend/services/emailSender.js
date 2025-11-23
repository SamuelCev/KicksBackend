const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMailWithPdf({ to, subject, text, pdfPath, pdfName }) {
  try {
    const attachments = [];

    // Logo
    const logoPath = path.join(__dirname, '../images/kicks_logo.png');
    if (fs.existsSync(logoPath)) {
      const logoContent = fs.readFileSync(logoPath).toString('base64');
      attachments.push({
        filename: 'kicks_logo.png',
        content: logoContent,
        content_id: 'logoprincipal', // Para usar con cid: en el HTML
      });
      console.log('✅ Logo encontrado y agregado');
    } else {
      console.warn('⚠️ Logo NO encontrado en:', logoPath);
    }

    // PDF
    if (pdfPath && fs.existsSync(pdfPath)) {
      const pdfContent = fs.readFileSync(pdfPath).toString('base64');
      attachments.push({
        filename: pdfName || 'Recibo.pdf',
        content: pdfContent,
      });
      console.log('✅ PDF encontrado y agregado');
    }

    const { data, error } = await resend.emails.send({
      from: 'KICKS <onboarding@resend.dev>', // Email de prueba de Resend
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: #505050ff;
              padding: 40px 20px;
              text-align: center;
            }
            .header img {
              width: 150px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 2px;
            }
            .content {
              padding: 40px 30px;
              color: #333333;
              line-height: 1.6;
            }
            .content h2 {
              color: #D01110;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
            }
            .content p {
              font-size: 16px;
              margin: 15px 0;
              color: #555555;
            }
            .footer {
              background-color: #f9f9f9;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #888888;
              border-top: 1px solid #eeeeee;
            }
            .footer p {
              margin: 5px 0;
            }
            .footer a {
              color: #D01110;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="cid:logoprincipal" alt="KICKS Logo" />
              <h1>KICKS</h1>
            </div>
            <div class="content">
              <h2>¡Bienvenido!</h2>
              <p>${text}</p>
            </div>
            <div class="footer">
              <p><strong>KICKS</strong> - Calzado de calidad que combina comodidad y diseño</p>
              <p>Kickstart your future.</p>
              <p>adminkicks@gmail.com | <a href="https://www.kicks.com">www.kicks.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      throw error;
    }

    console.log('✅ Correo enviado exitosamente:', data);
    return data;

  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
}

module.exports = { sendMailWithPdf };