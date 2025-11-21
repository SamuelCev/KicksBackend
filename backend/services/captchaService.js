const svgCaptcha = require('svg-captcha');

const captchaStore = new Map();
const CAPTCHA_EXPIRATION = 5 * 60 * 1000; // 5 minutos

function generateCaptcha() {
    const captcha = svgCaptcha.create({
        size: 5,
        ignoreChars: '0o1i', 
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });
    
    // Generar ID único
    const id = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Almacenar el captcha con timestamp
    captchaStore.set(id, {
        answer: captcha.text,
        timestamp: Date.now()
    });
    
    return { id, data: captcha.data };
}

function validateCaptcha(captchaId, userAnswer) {
    const captchaData = captchaStore.get(captchaId);
    
    // Verificar si existe el captcha
    if (!captchaData) {
        return false;
    }
    
    // Verificar si ha expirado
    if (Date.now() - captchaData.timestamp > CAPTCHA_EXPIRATION) {
        captchaStore.delete(captchaId);
        return false;
    }
    

    const isValid = captchaData.answer.toLowerCase() === userAnswer.toLowerCase();
    
    // Eliminar el captcha después de validarlo
    captchaStore.delete(captchaId);
    
    return isValid;
}

module.exports = {
    generateCaptcha,
    validateCaptcha
};
