require('dotenv').config();
const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    socket: {
        reconnectStrategy: (retries) => {
            logger.info(`Intento de reconexión a Redis #${retries}`);
            return Math.min(retries * 50, 1000);
        }
    }
});

redisClient.on('error', (err) => {
    logger.error('Error de conexión Redis:', err);
});

redisClient.on('connect', () => {
    logger.info('Conexión establecida con Redis');
});

redisClient.on('ready', () => {
    logger.info('Cliente Redis está listo para operaciones');
});

redisClient.on('reconnecting', () => {
    logger.warn('Intentando reconectar a Redis...');
});

// Conectar a Redis
(async () => {
    try {
        logger.info('Iniciando conexión a Redis...');
        await redisClient.connect();
        logger.info('Conexión a Redis establecida exitosamente');
    } catch (err) {
        logger.error('Error al conectar con Redis:', err);
    }
})();

module.exports = redisClient;
