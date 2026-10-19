import {
  CategoryAggregate,
  CategoryConflictError,
  CategoryValidationError,
} from '../aggregates/category.aggregate.js';
import { CategoryEntity } from '../entities/category.entity.js';
import type { CategoryEventBus } from '../events/category.event.js';
import type { CategoryRepository } from '../models/category.model.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import type {
  CategoryId,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';

export class CategoryService {
  constructor(
    private readonly repository: CategoryRepository,
    private readonly events: CategoryEventBus,
  ) {}

  async list(): Promise<CategoryEntity[]> {
    const records = await this.repository.findAll();
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

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new CategoryConflictError('Category is still referenced by products.');
    }

    await this.repository.delete(id);
    this.events.publish({ type: 'category.deleted', categoryId: id });
  }
}

export { CategoryConflictError, CategoryValidationError };
