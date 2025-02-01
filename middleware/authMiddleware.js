const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const redisUtils = require('../utils/redisUtils');

const verifyToken = async (req, res, next) => {
    const token = req.query.token;
    const userId = req.query.id;

    logger.info(`Iniciando verificación de token para userId: ${userId}`);
    logger.debug(`Token recibido: ${token?.substring(0, 10)}...`);

    if (!token || !userId) {
        logger.warn(`Verificación fallida: ${!token ? 'Token faltante' : 'ID faltante'}`);
        return res.status(401).json({ 
            error: 'Autenticación requerida',
            details: !token ? 'Token no proporcionado' : 'ID no proporcionado'
        });
    }

    try {
        logger.info('Verificando JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info('JWT verificado exitosamente');
        
        logger.info(`Buscando token en Redis para userId: ${userId}`);
        const storedToken = await redisUtils.getToken(userId);
        
        logger.debug(`Token almacenado en Redis: ${storedToken ? 'Encontrado' : 'No encontrado'}`);
        logger.debug(`¿Tokens coinciden?: ${storedToken === token}`);

        if (!storedToken || storedToken !== token) {
            logger.warn('Token no encontrado en Redis o no coincide');
            return res.status(401).json({
                error: 'Sesión inválida',
                details: 'Token no encontrado para este usuario'
            });
        }

        logger.info('Verificación completada exitosamente');
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Error en verificación de token:', error);
        return res.status(401).json({ 
            error: 'Token inválido',
            details: error.message 
        });
    }
};

module.exports = { verifyToken };
