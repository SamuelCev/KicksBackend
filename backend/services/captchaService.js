const captchaStore = new Map();

function generateCaptcha() {
    // Generar números aleatorios entre 1 y 20
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    
    // Operaciones posibles: suma y resta
    const operations = [
        { symbol: '+', calculate: (a, b) => a + b },
        { symbol: '-', calculate: (a, b) => a - b }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const answer = operation.calculate(num1, num2);
    const question = `¿Cuánto es ${num1} ${operation.symbol} ${num2}?`;
    
    // Generar ID único
    const id = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Almacenar el captcha con timestamp
    captchaStore.set(id, {
        answer: answer,
        timestamp: Date.now()
    });
    
    return { id, question };
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
    
    // Verificar la respuesta
    const isValid = captchaData.answer === parseInt(userAnswer);
    
    // Eliminar el captcha después de validarlo (un solo uso)
    captchaStore.delete(captchaId);
    
    return isValid;
}

module.exports = {
    generateCaptcha,
    validateCaptcha
};
