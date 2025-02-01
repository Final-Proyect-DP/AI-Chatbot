require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const redisClient = require('./config/redisConfig');
const swaggerDocs = require('./config/swaggerConfig');

const app = express();
const port = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'OK', redis: redisClient.isReady ? 'Connected' : 'Disconnected' });
});

// Rutas
app.use('/api', userRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor inmediatamente
app.listen(port, '0.0.0.0', () => {
  logger.info(`Servidor corriendo en http://0.0.0.0:${port}`);
  logger.info(`Documentación disponible en http://0.0.0.0:${port}/api-docs`);
});

// Manejo de señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Iniciando apagado graceful...');
  if (redisClient.isReady) {
    try {
      await redisClient.quit();
      logger.info('Conexión a Redis cerrada');
    } catch (error) {
      logger.error('Error al cerrar Redis:', error);
    }
  }
  process.exit(0);
}
