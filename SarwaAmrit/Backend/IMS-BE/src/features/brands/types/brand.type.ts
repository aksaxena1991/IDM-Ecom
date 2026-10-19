export type BrandId = string;

export const BRAND_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;

export type BrandStatus = (typeof BRAND_STATUSES)[number];

export interface BrandRecord {
  id: BrandId;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: BrandStatus;
  isVerified: boolean;
  verifiedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateBrandPayload {
  name: string;
  slug: string;
  code: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: BrandStatus;
  isVerified: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface UpdateBrandPayload {
  name?: string;
  slug?: string;
  code?: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status?: BrandStatus;
  isVerified?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface BrandListQuery {
  status?: BrandStatus;
  search?: string;
  isVerified?: boolean;
}

export interface BrandResponse {
  id: BrandId;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: BrandStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BrandListResponse {
  count: number;
  results: BrandResponse[];
}

export function isBrandStatus(value: string): value is BrandStatus {
  return (BRAND_STATUSES as readonly string[]).includes(value);
}
