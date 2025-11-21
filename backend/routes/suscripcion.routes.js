const express = require('express');
const { subscribeUser } = require('../controllers/suscripcion.controllers');

const router = express.Router();

/**
 * @swagger
 * /api/suscripcion:
 *   post:
 *     summary: Suscribirse al newsletter
 *     description: Registra un email para recibir el newsletter y envía un correo de bienvenida con un cupón de descuento del 10% (código DESCUENTO10)
 *     tags:
 *       - Suscripción
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
 *                 description: Email del usuario que se suscribe
 *                 example: "cliente@example.com"
 *     responses:
 *       200:
 *         description: Correo de suscripción enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Correo de suscripción enviado exitosamente"
 *       400:
 *         description: Email faltante o inválido
 *       500:
 *         description: Error al enviar el correo de suscripción
 */
router.post('/', subscribeUser);

module.exports = router;