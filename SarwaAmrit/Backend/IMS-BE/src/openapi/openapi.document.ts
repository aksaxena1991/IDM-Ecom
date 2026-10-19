import { openApiPaths } from './paths.js';
import { openApiSchemas } from './schemas.js';

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'IMS-BE — Inventory & Product Catalog API',
    version: '1.0.0',
    description:
      'REST API for categories, brands, and products. JSON request and response bodies use camelCase; snake_case aliases are accepted on write payloads where noted.',
  },
  servers: [
    { url: 'http://127.0.0.1:5001', description: 'Local development' },
    { url: '/', description: 'Current host (relative)' },
  ],
  tags: [
    { name: 'Health', description: 'Liveness and readiness probes' },
    { name: 'Categories', description: 'Category hierarchy' },
    { name: 'Brands', description: 'Brand catalog' },
    { name: 'Products', description: 'Product catalog' },
  ],
  paths: openApiPaths,
  components: {
    schemas: openApiSchemas,
  },
} as const;

export type OpenApiDocument = typeof openApiDocument;
