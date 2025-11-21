const { sendMailWithPdf } = require('../services/emailSender');

exports.contactUs = (req, res) => {
    const { email } = req.body;
    
    sendMailWithPdf({
        to: email,
        subject: 'Gracias por contactarnos',
        text: 'Bienvenido a la mejor tienda de sneakers en línea! Nos pondremos en contacto contigo pronto.',
    });

    res.status(200).json({ message: "Contacto recibido. Nos pondremos en contacto contigo pronto." });
}