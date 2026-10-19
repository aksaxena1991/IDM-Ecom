import { randomUUID } from 'node:crypto';

import type { BrandId, BrandListQuery, BrandRecord } from '../types/brand.type.js';

export interface BrandRepository {
  findAll(query?: BrandListQuery): Promise<BrandRecord[]>;
  findById(id: BrandId): Promise<BrandRecord | null>;
  findBySlug(slug: string): Promise<BrandRecord | null>;
  findByCode(code: string): Promise<BrandRecord | null>;
  save(record: BrandRecord): Promise<BrandRecord>;
  delete(id: BrandId): Promise<boolean>;
}

export class InMemoryBrandRepository implements BrandRepository {
  private readonly store = new Map<BrandId, BrandRecord>();

  async findAll(query: BrandListQuery = {}): Promise<BrandRecord[]> {
    const search = query.search?.trim().toLowerCase();

    return [...this.store.values()]
      .filter((record) => record.deletedAt === null)
      .filter((record) => (query.status ? record.status === query.status : true))
      .filter((record) =>
        query.isVerified !== undefined ? record.isVerified === query.isVerified : true,
      )
      .filter((record) => {
        if (!search) {
          return true;
        }
        return (
          record.name.toLowerCase().includes(search) ||
          record.slug.includes(search) ||
          record.code.toLowerCase().includes(search) ||
          (record.description?.toLowerCase().includes(search) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: BrandId): Promise<BrandRecord | null> {
    const record = this.store.get(id);
    if (!record || record.deletedAt !== null) {
      return null;
    }
    return record;
  }

  async findBySlug(slug: string): Promise<BrandRecord | null> {
    const normalized = slug.trim().toLowerCase();
    for (const record of this.store.values()) {
      if (record.deletedAt === null && record.slug === normalized) {
        return record;
      }
    }
    return null;
  }

  async findByCode(code: string): Promise<BrandRecord | null> {
    const normalized = code.trim().toUpperCase();
    for (const record of this.store.values()) {
      if (record.deletedAt === null && record.code === normalized) {
        return record;
      }
    }
    return null;
  }

  async save(record: BrandRecord): Promise<BrandRecord> {
    this.store.set(record.id, { ...record });
    return record;
  }

  async delete(id: BrandId): Promise<boolean> {
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
}

export function newBrandId(): BrandId {
  return randomUUID();
}
