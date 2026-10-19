import {
  ProductAggregate,
  ProductConflictError,
  type ProductReferenceValidators,
  ProductValidationError,
} from '../aggregates/product.aggregate.js';
import { ProductEntity } from '../entities/product.entity.js';
import type { ProductEventBus } from '../events/product.event.js';
import type { ProductRepository } from '../models/product.model.js';
import type {
  CreateProductPayload,
  ProductId,
  ProductListQuery,
  UpdateProductPayload,
} from '../types/product.type.js';

export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly events: ProductEventBus,
    private readonly validators: ProductReferenceValidators,
  ) {}

  async list(query: ProductListQuery = {}): Promise<ProductEntity[]> {
    const records = await this.repository.findAll(query);
    return records.map((record) => new ProductEntity(record));
  }

  async getById(id: ProductId): Promise<ProductEntity | null> {
    const record = await this.repository.findById(id);
    return record ? new ProductEntity(record) : null;
  }

  async create(payload: CreateProductPayload): Promise<ProductEntity> {
    const entity = await ProductAggregate.create(
      this.repository,
      this.validators,
      payload,
    );
    this.events.publish({ type: 'product.created', productId: entity.id });
    return entity;
  }

  async update(id: ProductId, payload: UpdateProductPayload): Promise<ProductEntity> {
    const entity = await ProductAggregate.update(
      this.repository,
      this.validators,
      id,
      payload,
    );
    this.events.publish({ type: 'product.updated', productId: entity.id });
    return entity;
  }

  async replace(id: ProductId, payload: CreateProductPayload): Promise<ProductEntity> {
    return this.update(id, {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      categoryId: payload.categoryId,
      brandId: payload.brandId,
      status: payload.status,
      isFeatured: payload.isFeatured,
      metaTitle: payload.metaTitle,
      metaDescription: payload.metaDescription,
    });
  }

  async delete(id: ProductId): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ProductValidationError('Product was not found.');
    }

    const variantCount = await this.repository.countVariants(id);
    if (variantCount > 0) {
      throw new ProductConflictError(
        'Product cannot be deleted while variants still exist.',
      );
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new ProductValidationError('Product was not found.');
    }

    this.events.publish({ type: 'product.deleted', productId: id });
  }
}

export { ProductConflictError, ProductValidationError };
