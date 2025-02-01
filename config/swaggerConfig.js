const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Chatbot',
      version: '1.0.0',
      description: 'API para el chatbot con autenticación'
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        variables: {
          port: {
            default: '3030'
          }
        }
      }
    ],
    components: {
      schemas: {
        ChatRequest: {
          type: 'object',
          properties: {
            message: { 
              type: 'string',
              description: 'Mensaje del usuario'
            }
          },
          required: ['message']
        },
        ChatResponse: {
          type: 'object',
          properties: {
            userMessage: { type: 'string' },
            botMessage: { type: 'string' },
            timestamp: { 
              type: 'string',
              format: 'date-time'
            },
            description: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(swaggerOptions);
