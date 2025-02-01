require('dotenv').config();
const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    socket: {
        reconnectStrategy: (retries) => {
            logger.info(`Redis reconnection attempt #${retries}`);
            return Math.min(retries * 50, 1000);
        }
    }
});

redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
    logger.info('Connection established with Redis');
});

redisClient.on('ready', () => {
    logger.info('Redis client is ready for operations');
});

redisClient.on('reconnecting', () => {
    logger.warn('Attempting to reconnect to Redis...');
});

// Connect to Redis
(async () => {
    try {
        logger.info('Starting connection to Redis...');
        await redisClient.connect();
        logger.info('Connection to Redis established successfully');
    } catch (err) {
        logger.error('Error connecting to Redis:', err);
    }
})();

module.exports = redisClient;