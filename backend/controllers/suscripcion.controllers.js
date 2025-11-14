const { sendMailWithPdf } = require('../services/emailSender');

exports.subscribeUser = async (req, res) => {
    const { email } = req.body;

    sendMailWithPdf({
        to: email,
        subject: '¡Tu suscripción ha sido exitosa!',
        text: 'Gracias por suscribirte a KICKS. Como regalo de bienvenida te ofrecemos un cupón de descuento del 10% en tu próxima compra. ¡Disfrútalo! Código del cupón: DESCUENTO10',
        pdfPath: null,
        pdfName: null
    }).then(info => {
        res.status(200).json({ message: 'Correo de suscripción enviado exitosamente', info });
    }).catch(error => {
        console.error('Error al enviar el correo de suscripción:', error);
        res.status(500).json({ message: 'Error al enviar el correo de suscripción' });
    });
}