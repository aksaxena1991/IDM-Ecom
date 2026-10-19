import type { CategoryId, CategoryRecord, CategoryStatus } from '../types/category.type.js';

export class CategoryEntity {
  readonly id: CategoryId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly status: CategoryStatus;
  readonly parentId: CategoryId | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(record: CategoryRecord) {
    this.id = record.id;
    this.name = record.name;
    this.slug = record.slug;
    this.description = record.description;
    this.status = record.status;
    this.parentId = record.parentId;
    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
    this.deletedAt = record.deletedAt;
  }

  toRecord(): CategoryRecord {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      status: this.status,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
