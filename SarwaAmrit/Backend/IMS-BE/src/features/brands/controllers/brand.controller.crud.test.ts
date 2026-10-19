import request from 'supertest';

import { createApp } from '../../../app.js';
import { BrandEventBus } from '../events/brand.event.js';
import { InMemoryBrandRepository } from '../models/brand.model.js';
import { BrandService } from '../services/brand.service.js';
import type { BrandListResponse, BrandResponse } from '../types/brand.type.js';

function createTestApp() {
  const repository = new InMemoryBrandRepository();
  const service = new BrandService(
    repository,
    new BrandEventBus(),
    async () => 0,
  );
  return { app: createApp({ brandService: service }), repository };
}

describe('Brand CRUD API', () => {
  it('creates, reads, updates, and soft-deletes a brand', async () => {
    const { app } = createTestApp();

    const created = await request(app)
      .post('/api/v1/brands')
      .send({
        name: 'Sarwa Optics',
        description: 'Fiber brand line',
        status: 'ACTIVE',
        isVerified: true,
      })
      .expect(201);

    const createdBody = created.body as BrandResponse;
    expect(createdBody.slug).toBe('sarwa-optics');
    expect(createdBody.code).toBe('SARWA_OPTICS');
    expect(createdBody.status).toBe('ACTIVE');
    expect(createdBody.isVerified).toBe(true);
    expect(createdBody.verifiedAt).not.toBeNull();

    const id = createdBody.id;

    await request(app).get(`/api/v1/brands/${id}`).expect(200);

    const patched = await request(app)
      .patch(`/api/v1/brands/${id}`)
      .send({ status: 'INACTIVE', isVerified: false })
      .expect(200);

    const patchedBody = patched.body as BrandResponse;
    expect(patchedBody.status).toBe('INACTIVE');
    expect(patchedBody.isVerified).toBe(false);
    expect(patchedBody.verifiedAt).toBeNull();

    await request(app).delete(`/api/v1/brands/${id}`).expect(204);
    await request(app).get(`/api/v1/brands/${id}`).expect(404);
  });

  it('lists brands with filters', async () => {
    const { app } = createTestApp();

    await request(app)
      .post('/api/v1/brands')
      .send({ name: 'Alpha Labs', status: 'DRAFT', isVerified: false })
      .expect(201);

    await request(app)
      .post('/api/v1/brands')
      .send({ name: 'Beta Verified', status: 'ACTIVE', isVerified: true })
      .expect(201);

    const filtered = await request(app)
      .get('/api/v1/brands')
      .query({ status: 'ACTIVE', isVerified: 'true', search: 'beta' })
      .expect(200);

    const listBody = filtered.body as BrandListResponse;
    expect(listBody.count).toBe(1);
    expect(listBody.results[0]?.name).toBe('Beta Verified');
  });

  it('returns 400 for invalid brand id', async () => {
    const { app } = createTestApp();
    await request(app).get('/api/v1/brands/not-a-uuid').expect(400);
  });
});
