import type { Express, RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './openapi.document.js';

export function setupSwagger(app: Express): void {
  const jsonHandler: RequestHandler = (_req, res) => {
    res.json(openApiDocument);
  };

  app.get('/api-docs/openapi.json', jsonHandler);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'IMS-BE API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );
}
