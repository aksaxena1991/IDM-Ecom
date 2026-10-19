import {
  CategoryAggregate,
  CategoryConflictError,
  CategoryValidationError,
} from '../aggregates/category.aggregate.js';
import { CategoryEntity } from '../entities/category.entity.js';
import type { CategoryEventBus } from '../events/category.event.js';
import type { CategoryRepository } from '../models/category.model.js';
import type {
  CategoryId,
  CategoryListQuery,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';

export type ProductCountByCategory = (categoryId: CategoryId) => Promise<number>;

export class CategoryService {
  constructor(
    private readonly repository: CategoryRepository,
    private readonly events: CategoryEventBus,
    private readonly countProductsInCategory: ProductCountByCategory,
  ) {}

  async list(query: CategoryListQuery = {}): Promise<CategoryEntity[]> {
    const records = await this.repository.findAll(query);
    return records.map((record) => new CategoryEntity(record));
  }

  async getById(id: CategoryId): Promise<CategoryEntity | null> {
    const record = await this.repository.findById(id);
    return record ? new CategoryEntity(record) : null;
  }

  async create(payload: CreateCategoryPayload): Promise<CategoryEntity> {
    const entity = await CategoryAggregate.create(this.repository, payload);
    this.events.publish({ type: 'category.created', categoryId: entity.id });
    return entity;
  }

  async update(id: CategoryId, payload: UpdateCategoryPayload): Promise<CategoryEntity> {
    const entity = await CategoryAggregate.update(this.repository, id, payload);
    this.events.publish({ type: 'category.updated', categoryId: entity.id });
    return entity;
  }

  async replace(id: CategoryId, payload: CreateCategoryPayload): Promise<CategoryEntity> {
    return this.update(id, {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      status: payload.status,
      parentId: payload.parentId,
    });
  }

  async delete(id: CategoryId): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new CategoryValidationError('Category was not found.');
    }

    const childCount = await this.repository.countChildren(id);
    if (childCount > 0) {
      throw new CategoryConflictError(
        'Category is still referenced by child categories.',
      );
    }

    const productCount = await this.countProductsInCategory(id);
    if (productCount > 0) {
      throw new CategoryConflictError('Category is still referenced by products.');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new CategoryValidationError('Category was not found.');
    }

    this.events.publish({ type: 'category.deleted', categoryId: id });
  }
}

export { CategoryConflictError, CategoryValidationError };
