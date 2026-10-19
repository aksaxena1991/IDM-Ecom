import type { BrandEntity } from '../entities/brand.entity.js';
import type { BrandListResponse, BrandResponse } from '../types/brand.type.js';

export function toBrandResponse(entity: BrandEntity): BrandResponse {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    code: entity.code,
    description: entity.description,
    logoUrl: entity.logoUrl,
    bannerUrl: entity.bannerUrl,
    status: entity.status,
    isVerified: entity.isVerified,
    verifiedAt: entity.verifiedAt?.toISOString() ?? null,
    metaTitle: entity.metaTitle,
    metaDescription: entity.metaDescription,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt?.toISOString() ?? null,
  };
}

export function toBrandListResponse(entities: BrandEntity[]): BrandListResponse {
  const results = entities.map((entity) => toBrandResponse(entity));
  return {
    count: results.length,
    results,
  };
}
