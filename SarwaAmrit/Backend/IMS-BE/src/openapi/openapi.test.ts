import request from 'supertest';

import { createApp } from '../app.js';
import { InMemoryCategoryRepository } from '../features/categories/models/category.model.js';
import { CategoryEventBus } from '../features/categories/events/category.event.js';
import { CategoryService } from '../features/categories/services/category.service.js';

describe('OpenAPI / Swagger', () => {
  it('serves the OpenAPI document and Swagger UI', async () => {
    const repository = new InMemoryCategoryRepository();
    const app = createApp({
      categoryService: new CategoryService(
        repository,
        new CategoryEventBus(),
        async () => 0,
      ),
    });

    const spec = await request(app).get('/api-docs/openapi.json').expect(200);
    const body = spec.body as {
      openapi: string;
      paths: Record<string, unknown>;
    };

    expect(body.openapi).toMatch(/^3\./);
    expect(body.paths['/healthz']).toBeDefined();
    expect(body.paths['/api/v1/categories']).toBeDefined();
    expect(body.paths['/api/v1/brands']).toBeDefined();
    expect(body.paths['/api/v1/products']).toBeDefined();

    await request(app).get('/api-docs/').expect(200);
  });
});
