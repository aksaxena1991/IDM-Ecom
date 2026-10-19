import type { CategoryId, CategoryRecord } from '../types/category.type.js';

export class CategoryEntity {
  readonly id: CategoryId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly parentId: CategoryId | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(record: CategoryRecord) {
    this.id = record.id;
    this.name = record.name;
    this.slug = record.slug;
    this.description = record.description;
    this.parentId = record.parentId;
    this.isActive = record.isActive;
    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
  }

  toRecord(): CategoryRecord {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      parentId: this.parentId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
