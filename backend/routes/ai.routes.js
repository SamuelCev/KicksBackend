const express = require("express");
const { generateAIResponse } = require("../controllers/aichat.controllers");

const router = express.Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat con el asistente virtual Kicksy
 *     description: Envía mensajes al asistente AI especializado en tenis/sneakers. El asistente puede buscar productos, categorías, marcas y proporcionar recomendaciones.
 *     tags:
 *       - AI Assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Historial de mensajes de la conversación
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                       description: Rol del mensaje
 *                     content:
 *                       type: string
 *                       description: Contenido del mensaje
 *           example:
 *             messages:
 *               - role: "user"
 *                 content: "¿Qué tenis Nike tienes disponibles?"
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "assistant"
 *                     content:
 *                       type: string
 *                       example: "Tenemos varios modelos Nike disponibles..."
 *       500:
 *         description: Error al generar respuesta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error generating AI response"
 */
router.post("/chat", generateAIResponse);

module.exports = router;