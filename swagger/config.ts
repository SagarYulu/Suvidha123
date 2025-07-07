import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yulu Employee Issue Management System API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Yulu Employee Issue Management System',
      contact: {
        name: 'API Support',
        email: 'support@yulu.bike'
      },
      license: {
        name: 'Private',
        url: '#'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.yulu.bike',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './swagger/auth.yaml',
    './swagger/employees.yaml',
    './swagger/dashboard-users.yaml',
    './swagger/issues.yaml',
    './swagger/holidays.yaml',
    './swagger/comments.yaml',
    './swagger/analytics.yaml',
    './swagger/sla.yaml',
    './swagger/rbac.yaml',
    './swagger/master-data.yaml',
    './swagger/feedback.yaml',
    './swagger/health.yaml'
  ]
};

export const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Yulu API Documentation',
    customfavIcon: '/favicon.ico'
  }));

  // Serve OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: http://localhost:5000/api-docs');
}