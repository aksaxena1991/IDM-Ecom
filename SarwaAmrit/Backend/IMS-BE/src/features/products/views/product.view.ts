import type { ProductEntity } from '../entities/product.entity.js';
import type { ProductListResponse, ProductResponse } from '../types/product.type.js';

export function toProductResponse(entity: ProductEntity): ProductResponse {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    shortDescription: entity.shortDescription,
    description: entity.description,
    categoryId: entity.categoryId,
    brandId: entity.brandId,
    status: entity.status,
    isFeatured: entity.isFeatured,
    metaTitle: entity.metaTitle,
    metaDescription: entity.metaDescription,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt?.toISOString() ?? null,
  };
}

export function toProductListResponse(entities: ProductEntity[]): ProductListResponse {
  const results = entities.map((entity) => toProductResponse(entity));
  return { count: results.length, results };
}
