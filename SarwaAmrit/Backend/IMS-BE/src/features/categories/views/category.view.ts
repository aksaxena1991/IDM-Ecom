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

export async function toCategoryListResponse(
  entities: CategoryEntity[],
  productCountByCategoryId: (categoryId: string) => Promise<number>,
): Promise<CategoryListResponse> {
  const results = await Promise.all(
    entities.map(async (entity) =>
      toCategoryResponse(entity, await productCountByCategoryId(entity.id)),
    ),
  );
  return {
    count: results.length,
    results,
  };
}
