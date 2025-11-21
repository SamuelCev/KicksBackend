const express = require('express');
const { getCaptcha, verifyCaptcha } = require('../controllers/captcha.controllers');

const router = express.Router();

/**
 * @swagger
 * /api/captcha/generate:
 *   get:
 *     summary: Generar un nuevo CAPTCHA
 *     description: Genera un CAPTCHA matemático simple para validación humana
 *     tags:
 *       - Captcha
 *     responses:
 *       200:
 *         description: CAPTCHA generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 captchaId:
 *                   type: string
 *                   description: ID único del CAPTCHA generado
 *                   example: "abc123def456"
 *                 question:
 *                   type: string
 *                   description: Pregunta matemática del CAPTCHA
 *                   example: "¿Cuánto es 5 + 3?"
 *       500:
 *         description: Error al generar CAPTCHA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al generar captcha"
 */
router.get('/generate', getCaptcha);

/**
 * @swagger
 * /api/captcha/validate:
 *   post:
 *     summary: Validar respuesta del CAPTCHA
 *     description: Verifica si la respuesta proporcionada es correcta para el CAPTCHA generado
 *     tags:
 *       - Captcha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - captchaId
 *               - answer
 *             properties:
 *               captchaId:
 *                 type: string
 *                 description: ID del CAPTCHA generado previamente
 *                 example: "abc123def456"
 *               answer:
 *                 type: number
 *                 description: Respuesta numérica del usuario
 *                 example: 8
 *     responses:
 *       200:
 *         description: CAPTCHA válido
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
 *                   example: "CAPTCHA válido"
 *       400:
 *         description: CAPTCHA inválido, expirado o campos faltantes
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
 *                   example: "CAPTCHA inválido o expirado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al validar captcha"
 */
router.post('/validate', verifyCaptcha);

module.exports = router;