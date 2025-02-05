require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const redisClient = require('./config/redisConfig');
const swaggerDocs = require('./config/swaggerConfig');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');
const authLoginConsumer = require('./consumers/authLoginConsumer');
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
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor y los consumidores
app.listen(port, '0.0.0.0', async () => {
  logger.info(`Server running at http://0.0.0.0:${port}`);
  logger.info(`Documentation available at http://0.0.0.0:${port}/api-docs`);
  
  try {
    // Inicializar consumidores de Kafka
    await authLoginConsumer.run();
    logger.info('Login consumer initialized successfully');
    
    await userLogoutConsumer.run();
    logger.info('Logout consumer initialized successfully');
  } catch (error) {
    logger.error('Error initializing Kafka consumers:', error);
  }
});

// Manejo de señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Starting graceful shutdown...');
  if (redisClient.isReady) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis:', error);
    }
  }
  process.exit(0);
}
