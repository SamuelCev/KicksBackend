const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMailWithPdf({ to, subject, text, pdfPath, pdfName }) {
  const mailOptions = {
    from: `"Mi App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: `
        <div>
        <img src="cid:logoprincipal" alt="Logo" style="width:150px;" />
        <h2>Bienvenido</h2>
        <p>Este correo contiene una imagen inline.</p>
        </div>
    `,
    text,
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
