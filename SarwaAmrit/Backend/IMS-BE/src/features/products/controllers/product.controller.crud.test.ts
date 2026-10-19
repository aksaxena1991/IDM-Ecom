import request from 'supertest';

import { createApp } from '../../../app.js';
import { CategoryAggregate } from '../../categories/aggregates/category.aggregate.js';
import { CategoryEventBus } from '../../categories/events/category.event.js';
import { InMemoryCategoryRepository } from '../../categories/models/category.model.js';
import { CategoryService } from '../../categories/services/category.service.js';
import { ProductEventBus } from '../events/product.event.js';
import { InMemoryProductRepository } from '../models/product.model.js';
import { ProductService } from '../services/product.service.js';
import type { ProductListResponse, ProductResponse } from '../types/product.type.js';

async function createTestApp() {
  const categoryRepository = new InMemoryCategoryRepository();
  const category = await CategoryAggregate.create(categoryRepository, {
    name: 'Electronics',
    slug: '',
    description: '',
    status: 'ACTIVE',
    parentId: null,
  });

  const productRepository = new InMemoryProductRepository();
  const productService = new ProductService(
    productRepository,
    new ProductEventBus(),
    {
      categoryExists: async (id) => !!(await categoryRepository.findById(id)),
      brandExists: async () => true,
    },
  );

  const categoryService = new CategoryService(
    categoryRepository,
    new CategoryEventBus(),
    async (categoryId) => productRepository.findAll({ categoryId }).then((r) => r.length),
  );

  return {
    app: createApp({ categoryService, productService }),
    categoryId: category.id,
    productRepository,
  };
}

describe('Product CRUD API', () => {
  it('creates, reads, updates, and soft-deletes a product', async () => {
    const { app, categoryId } = await createTestApp();

    const created = await request(app)
      .post('/api/v1/products')
      .send({
        name: 'Edge GPU Module',
        categoryId,
        shortDescription: '32GB compute module',
        status: 'DRAFT',
        isFeatured: true,
      })
      .expect(201);

    const createdBody = created.body as ProductResponse;
    expect(createdBody.slug).toBe('edge-gpu-module');
    expect(createdBody.categoryId).toBe(categoryId);

    const id = createdBody.id;

    await request(app).get(`/api/v1/products/${id}`).expect(200);

    const patched = await request(app)
      .patch(`/api/v1/products/${id}`)
      .send({ status: 'ACTIVE', isFeatured: false })
      .expect(200);

    const patchedBody = patched.body as ProductResponse;
    expect(patchedBody.status).toBe('ACTIVE');
    expect(patchedBody.isFeatured).toBe(false);

    await request(app).delete(`/api/v1/products/${id}`).expect(204);
    await request(app).get(`/api/v1/products/${id}`).expect(404);
  });

  it('lists products with filters', async () => {
    const { app, categoryId } = await createTestApp();

    await request(app)
      .post('/api/v1/products')
      .send({ name: 'Alpha Device', categoryId, status: 'DRAFT' })
      .expect(201);

    await request(app)
      .post('/api/v1/products')
      .send({ name: 'Beta Device', categoryId, status: 'ACTIVE', isFeatured: true })
      .expect(201);

    const filtered = await request(app)
      .get('/api/v1/products')
      .query({ status: 'ACTIVE', isFeatured: 'true', search: 'beta' })
      .expect(200);

    const listBody = filtered.body as ProductListResponse;
    expect(listBody.count).toBe(1);
    expect(listBody.results[0]?.name).toBe('Beta Device');
  });

  it('returns 409 when creating a duplicate product name in the same category', async () => {
    const { app, categoryId } = await createTestApp();

    await request(app)
      .post('/api/v1/products')
      .send({ name: 'Shared Widget', categoryId })
      .expect(201);

    const duplicate = await request(app)
      .post('/api/v1/products')
      .send({ name: 'shared widget', categoryId })
      .expect(409);

    expect(duplicate.body).toEqual({
      detail: 'Product name must be unique within this category.',
    });
  });

  it('blocks delete when variants exist', async () => {
    const { app, categoryId, productRepository } = await createTestApp();

    const created = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Locked Product', categoryId })
      .expect(201);

    const id = (created.body as ProductResponse).id;
    productRepository.setVariantCount(id, 2);

    await request(app).delete(`/api/v1/products/${id}`).expect(409);
  });
});
