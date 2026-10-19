import type { BrandId, BrandRecord, BrandStatus } from '../types/brand.type.js';

export class BrandEntity {
  readonly id: BrandId;
  readonly name: string;
  readonly slug: string;
  readonly code: string;
  readonly description: string | null;
  readonly logoUrl: string | null;
  readonly bannerUrl: string | null;
  readonly status: BrandStatus;
  readonly isVerified: boolean;
  readonly verifiedAt: Date | null;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(record: BrandRecord) {
    this.id = record.id;
    this.name = record.name;
    this.slug = record.slug;
    this.code = record.code;
    this.description = record.description;
    this.logoUrl = record.logoUrl;
    this.bannerUrl = record.bannerUrl;
    this.status = record.status;
    this.isVerified = record.isVerified;
    this.verifiedAt = record.verifiedAt;
    this.metaTitle = record.metaTitle;
    this.metaDescription = record.metaDescription;
    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
    this.deletedAt = record.deletedAt;
  }

  toRecord(): BrandRecord {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      code: this.code,
      description: this.description,
      logoUrl: this.logoUrl,
      bannerUrl: this.bannerUrl,
      status: this.status,
      isVerified: this.isVerified,
      verifiedAt: this.verifiedAt,
      metaTitle: this.metaTitle,
      metaDescription: this.metaDescription,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
