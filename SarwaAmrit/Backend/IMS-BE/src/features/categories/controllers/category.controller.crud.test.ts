import request from 'supertest';

import { createApp } from '../../../app.js';
import type { CategoryListResponse, CategoryResponse } from '../types/category.type.js';
import { CategoryEventBus } from '../events/category.event.js';
import { InMemoryCategoryRepository } from '../models/category.model.js';
import { CategoryService } from '../services/category.service.js';

function createTestApp() {
  const repository = new InMemoryCategoryRepository();
  const service = new CategoryService(
    repository,
    new CategoryEventBus(),
    async () => 0,
  );
  return { app: createApp({ categoryService: service }), repository };
}

describe('Category CRUD API', () => {
  it('creates, reads, updates, and soft-deletes a category', async () => {
    const { app } = createTestApp();

    const created = await request(app)
      .post('/api/v1/categories')
      .send({
        name: 'Optics & Fiber',
        description: 'Fiber catalog',
        status: 'ACTIVE',
      })
      .expect(201);

    const createdBody = created.body as CategoryResponse;
    expect(createdBody.slug).toBe('optics-fiber');
    expect(createdBody.status).toBe('ACTIVE');

    const id = createdBody.id;

    await request(app).get(`/api/v1/categories/${id}`).expect(200);

    const patched = await request(app)
      .patch(`/api/v1/categories/${id}`)
      .send({ status: 'INACTIVE', description: 'Paused line' })
      .expect(200);

    const patchedBody = patched.body as CategoryResponse;
    expect(patchedBody.status).toBe('INACTIVE');
    expect(patchedBody.description).toBe('Paused line');

    await request(app).delete(`/api/v1/categories/${id}`).expect(204);
    await request(app).get(`/api/v1/categories/${id}`).expect(404);
  });

  it('lists categories with filters', async () => {
    const { app } = createTestApp();

    await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Alpha', status: 'DRAFT' })
      .expect(201);

    await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Beta', status: 'ACTIVE' })
      .expect(201);

    const filtered = await request(app)
      .get('/api/v1/categories')
      .query({ status: 'ACTIVE', search: 'beta' })
      .expect(200);

    const listBody = filtered.body as CategoryListResponse;
    expect(listBody.count).toBe(1);
    expect(listBody.results[0]?.name).toBe('Beta');
  });

  it('returns 400 for invalid category id', async () => {
    const { app } = createTestApp();
    await request(app).get('/api/v1/categories/not-a-uuid').expect(400);
  });

  it('returns 409 when creating a duplicate category name', async () => {
    const { app } = createTestApp();

    await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Shared Name', status: 'DRAFT' })
      .expect(201);

    const duplicate = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'shared name', status: 'DRAFT' })
      .expect(409);

    expect(duplicate.body).toEqual({ detail: 'Category name must be unique.' });
  });
});
