import type { Category as CategoryRow, CategoryStatus as PrismaCategoryStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma.js';
import { CategoryConflictError } from '../aggregates/category.aggregate.js';
import type {
  CategoryId,
  CategoryListQuery,
  CategoryRecord,
  CategoryStatus,
} from '../types/category.type.js';
import { isCategoryStatus } from '../types/category.type.js';
import type { CategoryRepository } from './category.model.js';

export class PrismaCategoryRepository implements CategoryRepository {
  async findAll(query: CategoryListQuery = {}): Promise<CategoryRecord[]> {
    const search = query.search?.trim();

    const rows = await prisma.category.findMany({
      where: {
        deletedAt: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.parentId !== undefined ? { parentId: query.parentId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search.toLowerCase(), mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(toRecord);
  }

  async findById(id: CategoryId): Promise<CategoryRecord | null> {
    const row = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const row = await prisma.category.findFirst({
      where: { slug: slug.trim().toLowerCase(), deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async save(record: CategoryRecord): Promise<CategoryRecord> {
    try {
      const row = await prisma.category.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          name: record.name,
          slug: record.slug,
          description: record.description,
          status: toPrismaStatus(record.status),
          parentId: record.parentId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt,
        },
        update: {
          name: record.name,
          slug: record.slug,
          description: record.description,
          status: toPrismaStatus(record.status),
          parentId: record.parentId,
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
        throw new CategoryConflictError('Category slug must be unique.');
      }
      throw error;
    }
  }

  async delete(id: CategoryId): Promise<boolean> {
    try {
      await prisma.category.update({
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

  async countChildren(parentId: CategoryId): Promise<number> {
    return prisma.category.count({
      where: { parentId, deletedAt: null },
    });
  }
}

function toRecord(row: CategoryRow): CategoryRecord {
  const status = row.status;
  if (!isCategoryStatus(status)) {
    throw new Error(`Unexpected category status: ${String(status)}`);
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    status,
    parentId: row.parentId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

function toPrismaStatus(status: CategoryStatus): PrismaCategoryStatus {
  return status;
}
