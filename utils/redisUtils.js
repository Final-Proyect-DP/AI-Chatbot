const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const EXPIRATION_TIME = 3600; // 1 hora en segundos
const CHAT_EXPIRATION = 3600 * 24; // 24 horas

const redisUtils = {
  async setToken(userId, token) {
    try {
      logger.info(`Attempting to save token in Redis for userId: ${userId}`);
      await redisClient.set(userId, token);
      logger.info('Token saved successfully in Redis');
      return true;
    } catch (error) {
      logger.error('Error saving token in Redis:', error);
      throw error;
    }
  },

  async getToken(userId) {
    try {
      logger.info(`Intentando obtener token de Redis para userId: ${userId}`);
      const token = await redisClient.get(userId);
      logger.info(`Resultado de Redis: ${token ? 'Token encontrado' : 'Token no encontrado'}`);
      return token;
    } catch (error) {
      logger.error('Error al obtener token de Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      const result = await redisClient.del(userId);
      const message = result ? 'Session closed successfully' : 'Session not found';
      logger.info(`${message} for user ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error deleting token from Redis:', error);
      throw error;
    }
  },

  async getChatHistory(userId) {
    try {
      logger.info(`Fetching chat history for userId: ${userId}`);
      const history = await redisClient.get(`chat:${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      logger.error('Error fetching chat history:', error);
      throw error;
    }
  },

  async setChatHistory(userId, history) {
    try {
      logger.info(`Saving chat history for userId: ${userId}`);
      await redisClient.set(
        `chat:${userId}`,
        JSON.stringify(history),
        'EX',
        CHAT_EXPIRATION
      );
      logger.info('Chat history saved successfully');
    } catch (error) {
      logger.error('Error saving chat history:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
