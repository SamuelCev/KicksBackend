const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controllers');

// Solicitar código de recuperación
router.post('/request-reset', passwordController.requestPasswordReset);

// Restablecer contraseña con código
router.post('/reset', passwordController.resetPassword);

// Verificar si un código es válido 
router.post('/verify-code', passwordController.verifyCode);

module.exports = router;