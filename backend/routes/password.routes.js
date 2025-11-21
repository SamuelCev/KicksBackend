const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controllers');

/**
 * @swagger
 * /api/password/request-reset:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     description: Envía un código de 6 dígitos al email del usuario para iniciar el proceso de recuperación de contraseña. El código expira en 15 minutos.
 *     tags:
 *       - Recuperación de Contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario que desea recuperar su contraseña
 *                 example: "daniel@example.com"
 *     responses:
 *       200:
 *         description: Solicitud procesada (siempre retorna este mensaje por seguridad)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Si el email existe en nuestro sistema, recibirás un código de recuperación"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Email faltante o formato inválido
 *       500:
 *         description: Error del servidor
 */
router.post('/request-reset', passwordController.requestPasswordReset);

/**
 * @swagger
 * /api/password/verify-code:
 *   post:
 *     summary: Verificar código de recuperación
 *     description: Valida el código de 6 dígitos enviado por email. Máximo 3 intentos permitidos. Si es válido, retorna un resetToken para usar en el siguiente paso.
 *     tags:
 *       - Recuperación de Contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: "daniel@example.com"
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos recibido por email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Código verificado correctamente"
 *                 resetToken:
 *                   type: string
 *                   description: Token temporal para cambiar la contraseña (válido por 10 minutos)
 *                   example: "a1b2c3d4e5f6..."
 *       400:
 *         description: Código inválido, expirado o incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Código incorrecto"
 *                 remainingAttempts:
 *                   type: integer
 *                   description: Intentos restantes antes del bloqueo
 *                   example: 2
 *       429:
 *         description: Demasiados intentos fallidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos fallidos. Solicita un nuevo código"
 *       500:
 *         description: Error del servidor
 */
router.post('/verify-code', passwordController.verifyCode);

/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Cambiar contraseña con token verificado
 *     description: Actualiza la contraseña del usuario usando el resetToken obtenido al verificar el código. El token expira en 10 minutos y solo puede usarse una vez.
 *     tags:
 *       - Recuperación de Contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Token obtenido al verificar el código
 *                 example: "a1b2c3d4e5f6..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales)
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña cambiada exitosamente. Ya puedes iniciar sesión"
 *       400:
 *         description: Token inválido, expirado, ya usado, o contraseña débil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales"
 *       404:
 *         description: Usuario no encontrado o inactivo
 *       500:
 *         description: Error del servidor
 */
router.post('/reset', passwordController.resetPassword);

module.exports = router;