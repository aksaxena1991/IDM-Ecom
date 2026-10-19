import { randomUUID } from 'node:crypto';

import type {
  ProductId,
  ProductListQuery,
  ProductRecord,
} from '../types/product.type.js';

export interface ProductRepository {
  findAll(query?: ProductListQuery): Promise<ProductRecord[]>;
  findById(id: ProductId): Promise<ProductRecord | null>;
  findBySlug(slug: string): Promise<ProductRecord | null>;
  save(record: ProductRecord): Promise<ProductRecord>;
  delete(id: ProductId): Promise<boolean>;
  countVariants(productId: ProductId): Promise<number>;
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly store = new Map<ProductId, ProductRecord>();
  private readonly variantCounts = new Map<ProductId, number>();

  setVariantCount(productId: ProductId, count: number): void {
    this.variantCounts.set(productId, count);
  }

  async findAll(query: ProductListQuery = {}): Promise<ProductRecord[]> {
    const search = query.search?.trim().toLowerCase();

    return [...this.store.values()]
      .filter((record) => record.deletedAt === null)
      .filter((record) => (query.status ? record.status === query.status : true))
      .filter((record) =>
        query.categoryId ? record.categoryId === query.categoryId : true,
      )
      .filter((record) => (query.brandId ? record.brandId === query.brandId : true))
      .filter((record) =>
        query.isFeatured !== undefined ? record.isFeatured === query.isFeatured : true,
      )
      .filter((record) => {
        if (!search) {
          return true;
        }
        return (
          record.name.toLowerCase().includes(search) ||
          record.slug.includes(search) ||
          (record.shortDescription?.toLowerCase().includes(search) ?? false) ||
          (record.description?.toLowerCase().includes(search) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: ProductId): Promise<ProductRecord | null> {
    const record = this.store.get(id);
    if (!record || record.deletedAt !== null) {
      return null;
    }
    return record;
  }

  async findBySlug(slug: string): Promise<ProductRecord | null> {
    const normalized = slug.trim().toLowerCase();
    for (const record of this.store.values()) {
      if (record.deletedAt === null && record.slug === normalized) {
        return record;
      }
    }
    return null;
  }

  async save(record: ProductRecord): Promise<ProductRecord> {
    this.store.set(record.id, { ...record });
    return record;
  }

  async delete(id: ProductId): Promise<boolean> {
    const record = this.store.get(id);
    if (!record) {
      return false;
    }
    this.store.set(id, {
      ...record,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  }

  async countVariants(productId: ProductId): Promise<number> {
    return this.variantCounts.get(productId) ?? 0;
  }
}

export function newProductId(): ProductId {
  return randomUUID();
}
