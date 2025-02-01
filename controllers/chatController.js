const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../config/logger');
const redisUtils = require('../utils/redisUtils');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const chatController = {
    async handleChat(req, res) {
        const userId = req.query.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Mensaje requerido' });
        }

        try {
            // Obtener historial del chat
            let chatHistory = await redisUtils.getChatHistory(userId) || [];
            logger.info(`Historial recuperado para usuario ${userId}: ${chatHistory.length} mensajes`);

            // Construir el contexto con el historial
            const conversationContext = chatHistory.map(msg => 
                `${msg.role}: ${msg.content}`
            ).join('\n');

            // Preparar prompt con contexto
            const fullPrompt = conversationContext + 
                             `\nUsuario: ${message}\nAsistente:`;

            // Generar respuesta
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(fullPrompt);
            const botMessage = await result.response.text();

            // Actualizar historial
            chatHistory.push(
                { role: 'usuario', content: message },
                { role: 'asistente', content: botMessage }
            );

            // Mantener solo los últimos 10 mensajes para evitar tokens excesivos
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }

            // Guardar historial actualizado
            await redisUtils.setChatHistory(userId, chatHistory);
            logger.info(`Historial actualizado para usuario ${userId}`);

            res.json({
                userMessage: message,
                botMessage
            });
        } catch (error) {
            logger.error('Error en chat:', error);
            res.status(500).json({ error: 'Error al procesar el mensaje' });
        }
    }
};

module.exports = chatController;
