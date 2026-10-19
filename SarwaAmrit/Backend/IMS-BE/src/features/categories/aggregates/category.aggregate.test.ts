import {
  CategoryAggregate,
  CategoryConflictError,
  CategoryValidationError,
  slugify,
} from './category.aggregate.js';
import { InMemoryCategoryRepository } from '../models/category.model.js';

const basePayload = {
  slug: '',
  description: '',
  status: 'DRAFT' as const,
  parentId: null,
};

describe('slugify', () => {
  it('normalizes names into URL slugs', () => {
    expect(slugify('Optics & Fiber')).toBe('optics-fiber');
  });

  it('falls back when input has no alphanumeric characters', () => {
    expect(slugify('   ')).toBe('category');
  });
});

describe('CategoryAggregate.create', () => {
  it('rejects empty names', async () => {
    const repository = new InMemoryCategoryRepository();

    await expect(
      CategoryAggregate.create(repository, { ...basePayload, name: '   ' }),
    ).rejects.toBeInstanceOf(CategoryValidationError);
  });

  it('creates a category with a generated slug', async () => {
    const repository = new InMemoryCategoryRepository();
    const entity = await CategoryAggregate.create(repository, {
      ...basePayload,
      name: 'Power Systems',
    });

    expect(entity.name).toBe('Power Systems');
    expect(entity.slug).toBe('power-systems');
    expect(entity.status).toBe('DRAFT');
    expect(entity.deletedAt).toBeNull();
  });

  it('rejects duplicate names (case-insensitive)', async () => {
    const repository = new InMemoryCategoryRepository();
    await CategoryAggregate.create(repository, {
      ...basePayload,
      name: 'Power Systems',
    });

    await expect(
      CategoryAggregate.create(repository, {
        ...basePayload,
        name: 'power systems',
      }),
    ).rejects.toBeInstanceOf(CategoryConflictError);
  });
});
