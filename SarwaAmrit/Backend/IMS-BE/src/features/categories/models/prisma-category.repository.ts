import type { Category as CategoryRow } from '../../../generated/prisma/index.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import type { CategoryId, CategoryRecord } from '../types/category.type.js';
import type { CategoryRepository } from './category.model.js';

export class PrismaCategoryRepository implements CategoryRepository {
  async findAll(): Promise<CategoryRecord[]> {
    const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toRecord);
  }

  async findById(id: CategoryId): Promise<CategoryRecord | null> {
    const row = await prisma.category.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const row = await prisma.category.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });
    return row ? toRecord(row) : null;
  }

  async save(record: CategoryRecord): Promise<CategoryRecord> {
    const row = await prisma.category.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        name: record.name,
        slug: record.slug,
        description: record.description,
        parentId: record.parentId,
        isActive: record.isActive,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      update: {
        name: record.name,
        slug: record.slug,
        description: record.description,
        parentId: record.parentId,
        isActive: record.isActive,
        updatedAt: record.updatedAt,
      },
    });
    return toRecord(row);
  }

  async delete(id: CategoryId): Promise<boolean> {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async countChildren(parentId: CategoryId): Promise<number> {
    return prisma.category.count({ where: { parentId } });
  }
}

function toRecord(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
