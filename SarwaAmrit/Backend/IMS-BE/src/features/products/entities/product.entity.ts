import type { ProductId, ProductRecord } from '../types/product.type.js';

export class ProductEntity {
  readonly id: ProductId;
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string | null;
  readonly description: string | null;
  readonly categoryId: ProductRecord['categoryId'];
  readonly brandId: ProductRecord['brandId'];
  readonly status: ProductRecord['status'];
  readonly isFeatured: boolean;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(record: ProductRecord) {
    this.id = record.id;
    this.name = record.name;
    this.slug = record.slug;
    this.shortDescription = record.shortDescription;
    this.description = record.description;
    this.categoryId = record.categoryId;
    this.brandId = record.brandId;
    this.status = record.status;
    this.isFeatured = record.isFeatured;
    this.metaTitle = record.metaTitle;
    this.metaDescription = record.metaDescription;
    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
    this.deletedAt = record.deletedAt;
  }

  toRecord(): ProductRecord {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      shortDescription: this.shortDescription,
      description: this.description,
      categoryId: this.categoryId,
      brandId: this.brandId,
      status: this.status,
      isFeatured: this.isFeatured,
      metaTitle: this.metaTitle,
      metaDescription: this.metaDescription,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
