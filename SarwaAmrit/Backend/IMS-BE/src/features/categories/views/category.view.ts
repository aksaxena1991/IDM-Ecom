import type { CategoryEntity } from '../entities/category.entity.js';
import type { CategoryListResponse, CategoryResponse } from '../types/category.type.js';

export function toCategoryResponse(
  entity: CategoryEntity,
  productCount = 0,
): CategoryResponse {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    parent_id: entity.parentId,
    is_active: entity.isActive,
    product_count: productCount,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

export function toCategoryListResponse(
  entities: CategoryEntity[],
  productCountByCategoryId: (categoryId: string) => number,
): CategoryListResponse {
  const results = entities.map((entity) =>
    toCategoryResponse(entity, productCountByCategoryId(entity.id)),
  );
  return {
    count: results.length,
    results,
  };
}
