const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../config/logger');
const redisUtils = require('../utils/redisUtils');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const chatController = {
    async handleChat(req, res) {
        const userId = req.query.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        try {
           
            let chatHistory = await redisUtils.getChatHistory(userId) || [];
            logger.info(`History retrieved for user ${userId}: ${chatHistory.length} messages`);

            const conversationContext = chatHistory.map(msg => 
                `${msg.role === 'usuario' ? 'user' : 'assistant'}: ${msg.content}`
            ).join('\n');

          
            const fullPrompt = conversationContext + 
                             `\nUser: ${message}\nAssistant:`;

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(fullPrompt);
            const botMessage = await result.response.text();

  
            chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: botMessage }
            );

            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }

            await redisUtils.setChatHistory(userId, chatHistory);
            logger.info(`History updated for user ${userId}`);

            res.json({
                userMessage: message,
                botMessage
            });
        } catch (error) {
            logger.error('Error in chat:', error);
            res.status(500).json({ error: 'Error processing message' });
        }
    }
};

module.exports = chatController;
