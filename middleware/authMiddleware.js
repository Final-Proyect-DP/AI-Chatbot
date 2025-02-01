const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const redisUtils = require('../utils/redisUtils');

const verifyToken = async (req, res, next) => {
    const token = req.query.token;
    const userId = req.query.id;

    logger.info(`Starting token verification for userId: ${userId}`);
    logger.debug(`Received token: ${token?.substring(0, 10)}...`);

    if (!token || !userId) {
        logger.warn(`Verification failed: ${!token ? 'Missing token' : 'Missing ID'}`);
        return res.status(401).json({ 
            error: 'Authentication required',
            details: !token ? 'Token not provided' : 'ID not provided'
        });
    }

    try {
        logger.info('Verifying JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info('JWT verified successfully');
        
        logger.info(`Looking for token in Redis for userId: ${userId}`);
        const storedToken = await redisUtils.getToken(userId);
        
        logger.debug(`Token stored in Redis: ${storedToken ? 'Found' : 'Not found'}`);
        logger.debug(`Tokens match?: ${storedToken === token}`);

        if (!storedToken || storedToken !== token) {
            logger.warn('Token not found in Redis or does not match');
            return res.status(401).json({
                error: 'Invalid session',
                details: 'Token not found for this user'
            });
        }

        logger.info('Verification completed successfully');
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Error in token verification:', error);
        return res.status(401).json({ 
            error: 'Token inválido',
            details: error.message 
        });
    }
};

module.exports = { verifyToken };
