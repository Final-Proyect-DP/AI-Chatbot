const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the chatbot
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
 *                 example: "How are you?"
 *     responses:
 *       200:
 *         description: Successful chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMessage:
 *                   type: string
 *                   example: "How are you?"
 *                 botMessage:
 *                   type: string
 *                   example: "Hello! I'm here to help."
 *       401:
 *         description: Invalid token or ID not provided
 *       500:
 *         description: Server error
 */
router.post('/chat', verifyToken, chatController.handleChat);

module.exports = router;
