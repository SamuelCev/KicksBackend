const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER ||  'nickcinq4@gmail.com',
    pass: process.env.MAIL_PASS || 'mlai qujf bfoi gbbt',
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

async function sendMailWithPdf({ to, subject, text, pdfPath, pdfName }) {
  const mailOptions = {
    from: `"Kicks" <${process.env.MAIL_USER || 'nickcinq4@gmail.com'}>`,
    to,
    subject,
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
    attachments: [
        {
            filename: 'kicks_logo.png',
            path: path.join(__dirname, '../images/kicks_logo.png'),
            cid: 'logoprincipal'
        }
    ],
  };

  if (pdfPath) {
    mailOptions.attachments.push({
      filename: pdfName || 'Recibo.pdf',
      path: pdfPath,
      contentType: 'application/pdf',
    });
  }



  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendMailWithPdf };
