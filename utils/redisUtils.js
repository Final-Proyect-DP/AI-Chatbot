const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const EXPIRATION_TIME = 3600; // 1 hora en segundos
const CHAT_EXPIRATION = 3600 * 24; // 24 horas

const redisUtils = {
  async setToken(userId, token) {
    try {
      logger.info(`Intentando guardar token en Redis para userId: ${userId}`);
      await redisClient.set(userId, token);
      logger.info('Token guardado exitosamente en Redis');
      return true;
    } catch (error) {
      logger.error('Error al guardar token en Redis:', error);
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
      const message = result ? 'Sesión cerrada exitosamente' : 'Sesión no encontrada';
      logger.info(`${message} para usuario ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error al eliminar token de Redis:', error);
      throw error;
    }
  },

  async getChatHistory(userId) {
    try {
      logger.info(`Obteniendo historial de chat para userId: ${userId}`);
      const history = await redisClient.get(`chat:${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      logger.error('Error al obtener historial de chat:', error);
      throw error;
    }
  },

  async setChatHistory(userId, history) {
    try {
      logger.info(`Guardando historial de chat para userId: ${userId}`);
      await redisClient.set(
        `chat:${userId}`,
        JSON.stringify(history),
        'EX',
        CHAT_EXPIRATION
      );
      logger.info('Historial guardado exitosamente');
    } catch (error) {
      logger.error('Error al guardar historial de chat:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
