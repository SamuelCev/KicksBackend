const { generateCaptcha, validateCaptcha } = require('../services/captchaService');

exports.getCaptcha = (req, res) => {
    try {
        const captcha = generateCaptcha();
        res.json({
            captchaId: captcha.id,
            image: captcha.data
        });
    } catch (error) {
        console.error('Error al generar captcha:', error);
        res.status(500).json({ message: 'Error al generar captcha' });
    }
};

exports.verifyCaptcha = (req, res) => {
    const { captchaId, answer } = req.body;
    
    // Validación de campos
    if (!captchaId || answer === undefined) {
        return res.status(400).json({ 
            message: 'captchaId y answer son obligatorios' 
        });
    }
    
    try {
        const isValid = validateCaptcha(captchaId, answer);
        
        if (isValid) {
            res.json({ 
                valid: true,
                message: 'CAPTCHA válido' 
            });
        } else {
            res.status(400).json({ 
                valid: false,
                message: 'CAPTCHA inválido o expirado' 
            });
        }
    } catch (error) {
        console.error('Error al validar captcha:', error);
        res.status(500).json({ message: 'Error al validar captcha' });
    }
};
