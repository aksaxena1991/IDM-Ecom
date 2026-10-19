import type { CategoryEntity } from '../entities/category.entity.js';
import type { CategoryListResponse, CategoryResponse } from '../types/category.type.js';

export function toCategoryResponse(entity: CategoryEntity): CategoryResponse {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    status: entity.status,
    parentId: entity.parentId,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt?.toISOString() ?? null,
  };
}

export function toCategoryListResponse(entities: CategoryEntity[]): CategoryListResponse {
  const results = entities.map((entity) => toCategoryResponse(entity));
  return {
    count: results.length,
    results,
  };
}
