import type { Product as ProductRow, ProductStatus as PrismaProductStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma.js';
import { ProductConflictError } from '../aggregates/product.aggregate.js';
import type {
  CategoryId,
  ProductId,
  ProductListQuery,
  ProductRecord,
  ProductStatus,
} from '../types/product.type.js';
import { isProductStatus } from '../types/product.type.js';
import type { ProductRepository } from './product.model.js';

export class PrismaProductRepository implements ProductRepository {
  async findAll(query: ProductListQuery = {}): Promise<ProductRecord[]> {
    const search = query.search?.trim();

    const rows = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.brandId ? { brandId: query.brandId } : {}),
        ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search.toLowerCase(), mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    return rows.map(toRecord);
  }

  async findById(id: ProductId): Promise<ProductRecord | null> {
    const row = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async findByNameInCategory(
    categoryId: CategoryId,
    name: string,
  ): Promise<ProductRecord | null> {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }
    const row = await prisma.product.findFirst({
      where: {
        categoryId,
        deletedAt: null,
        name: { equals: trimmed, mode: 'insensitive' },
      },
    });
    return row ? toRecord(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductRecord | null> {
    const row = await prisma.product.findFirst({
      where: { slug: slug.trim().toLowerCase(), deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async save(record: ProductRecord): Promise<ProductRecord> {
    try {
      const row = await prisma.product.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          name: record.name,
          slug: record.slug,
          shortDescription: record.shortDescription,
          description: record.description,
          categoryId: record.categoryId,
          brandId: record.brandId,
          status: toPrismaStatus(record.status),
          isFeatured: record.isFeatured,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt,
        },
        update: {
          name: record.name,
          slug: record.slug,
          shortDescription: record.shortDescription,
          description: record.description,
          categoryId: record.categoryId,
          brandId: record.brandId,
          status: toPrismaStatus(record.status),
          isFeatured: record.isFeatured,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt,
        },
      });
      return toRecord(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ProductConflictError(
          'Product name must be unique within the category, and slug must be globally unique.',
        );
      }
      throw error;
    }
  }

  async delete(id: ProductId): Promise<boolean> {
    try {
      await prisma.product.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), updatedAt: new Date() },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }
      throw error;
    }
  }

  async countVariants(productId: ProductId): Promise<number> {
    return prisma.productVariant.count({ where: { productId } });
  }
}

function toRecord(row: ProductRow): ProductRecord {
  const status = row.status;
  if (!isProductStatus(status)) {
    throw new Error(`Unexpected product status: ${String(status)}`);
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    categoryId: row.categoryId,
    brandId: row.brandId,
    status,
    isFeatured: row.isFeatured,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

function toPrismaStatus(status: ProductStatus): PrismaProductStatus {
  return status;
}
