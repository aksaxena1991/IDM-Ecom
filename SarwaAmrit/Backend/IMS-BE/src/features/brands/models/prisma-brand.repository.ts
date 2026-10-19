import type { Brand as BrandRow, BrandStatus as PrismaBrandStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma.js';
import { BrandConflictError } from '../aggregates/brand.aggregate.js';
import type { BrandId, BrandListQuery, BrandRecord, BrandStatus } from '../types/brand.type.js';
import { isBrandStatus } from '../types/brand.type.js';
import type { BrandRepository } from './brand.model.js';

export class PrismaBrandRepository implements BrandRepository {
  async findAll(query: BrandListQuery = {}): Promise<BrandRecord[]> {
    const search = query.search?.trim();

    const rows = await prisma.brand.findMany({
      where: {
        deletedAt: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.isVerified !== undefined ? { isVerified: query.isVerified } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search.toLowerCase(), mode: 'insensitive' } },
                { code: { contains: search.toUpperCase(), mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(toRecord);
  }

  async findById(id: BrandId): Promise<BrandRecord | null> {
    const row = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async findBySlug(slug: string): Promise<BrandRecord | null> {
    const row = await prisma.brand.findFirst({
      where: { slug: slug.trim().toLowerCase(), deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async findByCode(code: string): Promise<BrandRecord | null> {
    const row = await prisma.brand.findFirst({
      where: { code: code.trim().toUpperCase(), deletedAt: null },
    });
    return row ? toRecord(row) : null;
  }

  async save(record: BrandRecord): Promise<BrandRecord> {
    try {
      const row = await prisma.brand.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          name: record.name,
          slug: record.slug,
          code: record.code,
          description: record.description,
          logoUrl: record.logoUrl,
          bannerUrl: record.bannerUrl,
          status: toPrismaStatus(record.status),
          isVerified: record.isVerified,
          verifiedAt: record.verifiedAt,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt,
        },
        update: {
          name: record.name,
          slug: record.slug,
          code: record.code,
          description: record.description,
          logoUrl: record.logoUrl,
          bannerUrl: record.bannerUrl,
          status: toPrismaStatus(record.status),
          isVerified: record.isVerified,
          verifiedAt: record.verifiedAt,
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
        throw new BrandConflictError('Brand name, slug, or code must be unique.');
      }
      throw error;
    }
  }

  async delete(id: BrandId): Promise<boolean> {
    try {
      await prisma.brand.update({
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
}

function toRecord(row: BrandRow): BrandRecord {
  const status = row.status;
  if (!isBrandStatus(status)) {
    throw new Error(`Unexpected brand status: ${String(status)}`);
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.code,
    description: row.description,
    logoUrl: row.logoUrl,
    bannerUrl: row.bannerUrl,
    status,
    isVerified: row.isVerified,
    verifiedAt: row.verifiedAt,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

function toPrismaStatus(status: BrandStatus): PrismaBrandStatus {
  return status;
}
