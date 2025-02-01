const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Enviar un mensaje al chatbot
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "123"
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Cómo estás?"
 *     responses:
 *       200:
 *         description: Respuesta exitosa del chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMessage:
 *                   type: string
 *                   example: "¿Cómo estás?"
 *                 botMessage:
 *                   type: string
 *                   example: "¡Hola! Estoy aquí para ayudarte."
 *       401:
 *         description: Token inválido o ID no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.post('/chat', verifyToken, chatController.handleChat);

module.exports = router;
