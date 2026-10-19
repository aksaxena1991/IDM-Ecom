export type ProductId = string;
export type ProductVariantId = string;
export type ProductMediaId = string;
export type BrandId = string;
export type VendorId = string;
export type VendorListingId = string;
export type CategoryId = string;

export const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_VARIANT_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductVariantStatus = (typeof PRODUCT_VARIANT_STATUSES)[number];

export const VENDOR_LISTING_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'OUT_OF_STOCK',
] as const;
export type VendorListingStatus = (typeof VENDOR_LISTING_STATUSES)[number];

export const PRODUCT_MEDIA_TYPES = ['IMAGE', 'VIDEO'] as const;
export type ProductMediaType = (typeof PRODUCT_MEDIA_TYPES)[number];

export type VariantAttributes = Record<string, string | number | boolean | null>;

export interface ProductRecord {
  id: ProductId;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: CategoryId;
  brandId: BrandId | null;
  status: ProductStatus;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProductVariantRecord {
  id: ProductVariantId;
  productId: ProductId;
  sku: string;
  name: string;
  barcode: string | null;
  attributes: VariantAttributes | null;
  weightGrams: number | null;
  status: ProductVariantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMediaRecord {
  id: ProductMediaId;
  productId: ProductId;
  variantId: ProductVariantId | null;
  type: ProductMediaType;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface BrandRecord {
  id: BrandId;
  name: string;
  slug: string;
  code: string;
  logoUrl: string | null;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorRecord {
  id: VendorId;
  name: string;
  code: string;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorListingRecord {
  id: VendorListingId;
  vendorId: VendorId;
  variantId: ProductVariantId;
  price: string;
  mrp: string;
  currency: string;
  stockQuantity: number;
  status: VendorListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId: CategoryId;
  brandId?: BrandId | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: CategoryId;
  brandId?: BrandId | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ProductResponse {
  id: ProductId;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: CategoryId;
  brandId: BrandId | null;
  status: ProductStatus;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProductListResponse {
  count: number;
  results: ProductResponse[];
}

export interface ProductListQuery {
  status?: ProductStatus;
  search?: string;
  categoryId?: CategoryId;
  brandId?: BrandId;
  isFeatured?: boolean;
}

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function isProductVariantStatus(value: string): value is ProductVariantStatus {
  return (PRODUCT_VARIANT_STATUSES as readonly string[]).includes(value);
}

export function isVendorListingStatus(value: string): value is VendorListingStatus {
  return (VENDOR_LISTING_STATUSES as readonly string[]).includes(value);
}

export function isProductMediaType(value: string): value is ProductMediaType {
  return (PRODUCT_MEDIA_TYPES as readonly string[]).includes(value);
}
