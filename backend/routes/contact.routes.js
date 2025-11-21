const express = require('express');
const { contactUs } = require('../controllers/contact.controllers');

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Formulario de contacto
 *     description: Envía un correo de confirmación al usuario que se pone en contacto con la tienda
 *     tags:
 *       - Contacto
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
 *                 description: Email del usuario que contacta
 *                 example: "cliente@example.com"
 *     responses:
 *       200:
 *         description: Contacto recibido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contacto recibido. Nos pondremos en contacto contigo pronto."
 *       400:
 *         description: Email faltante o inválido
 *       500:
 *         description: Error al enviar el correo
 */
router.post('/', contactUs);

module.exports = router;