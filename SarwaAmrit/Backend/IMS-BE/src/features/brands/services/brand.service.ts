import {
  BrandAggregate,
  BrandConflictError,
  BrandValidationError,
} from '../aggregates/brand.aggregate.js';
import { BrandEntity } from '../entities/brand.entity.js';
import type { BrandEventBus } from '../events/brand.event.js';
import type { BrandRepository } from '../models/brand.model.js';
import type {
  BrandId,
  BrandListQuery,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '../types/brand.type.js';

export type ProductCountByBrand = (brandId: BrandId) => Promise<number>;

export class BrandService {
  constructor(
    private readonly repository: BrandRepository,
    private readonly events: BrandEventBus,
    private readonly countProductsForBrand: ProductCountByBrand,
  ) {}

  async list(query: BrandListQuery = {}): Promise<BrandEntity[]> {
    const records = await this.repository.findAll(query);
    return records.map((record) => new BrandEntity(record));
  }

  async getById(id: BrandId): Promise<BrandEntity | null> {
    const record = await this.repository.findById(id);
    return record ? new BrandEntity(record) : null;
  }

  async create(payload: CreateBrandPayload): Promise<BrandEntity> {
    const entity = await BrandAggregate.create(this.repository, payload);
    this.events.publish({ type: 'brand.created', brandId: entity.id });
    return entity;
  }

  async update(id: BrandId, payload: UpdateBrandPayload): Promise<BrandEntity> {
    const entity = await BrandAggregate.update(this.repository, id, payload);
    this.events.publish({ type: 'brand.updated', brandId: entity.id });
    return entity;
  }

  async replace(id: BrandId, payload: CreateBrandPayload): Promise<BrandEntity> {
    return this.update(id, {
      name: payload.name,
      slug: payload.slug,
      code: payload.code,
      description: payload.description,
      logoUrl: payload.logoUrl,
      bannerUrl: payload.bannerUrl,
      status: payload.status,
      isVerified: payload.isVerified,
      metaTitle: payload.metaTitle,
      metaDescription: payload.metaDescription,
    });
  }

  async delete(id: BrandId): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new BrandValidationError('Brand was not found.');
    }

    const productCount = await this.countProductsForBrand(id);
    if (productCount > 0) {
      throw new BrandConflictError('Brand is still referenced by products.');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new BrandValidationError('Brand was not found.');
    }

    this.events.publish({ type: 'brand.deleted', brandId: id });
  }
}

export { BrandConflictError, BrandValidationError };
