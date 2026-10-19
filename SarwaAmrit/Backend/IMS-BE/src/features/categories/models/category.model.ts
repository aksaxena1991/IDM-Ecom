import { randomUUID } from 'node:crypto';

import type { CategoryId, CategoryRecord } from '../types/category.type.js';

export interface CategoryRepository {
  findAll(): Promise<CategoryRecord[]>;
  findById(id: CategoryId): Promise<CategoryRecord | null>;
  findBySlug(slug: string): Promise<CategoryRecord | null>;
  save(record: CategoryRecord): Promise<CategoryRecord>;
  delete(id: CategoryId): Promise<boolean>;
  countChildren(parentId: CategoryId): Promise<number>;
}

export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly store = new Map<CategoryId, CategoryRecord>();

  async findAll(): Promise<CategoryRecord[]> {
    return [...this.store.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: CategoryId): Promise<CategoryRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const normalized = slug.trim().toLowerCase();
    for (const record of this.store.values()) {
      if (record.slug === normalized) {
        return record;
      }
    }
    return null;
  }

  async save(record: CategoryRecord): Promise<CategoryRecord> {
    this.store.set(record.id, { ...record });
    return record;
  }

  async delete(id: CategoryId): Promise<boolean> {
    return this.store.delete(id);
  }

  async countChildren(parentId: CategoryId): Promise<number> {
    let count = 0;
    for (const record of this.store.values()) {
      if (record.parentId === parentId) {
        count += 1;
      }
    }
    return count;
  }
}

export function newCategoryId(): CategoryId {
  return randomUUID();
}
