export type CategoryId = string;

export const CATEGORY_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export interface CategoryRecord {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  parentId: CategoryId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  parentId: CategoryId | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  status?: CategoryStatus;
  parentId?: CategoryId | null;
}

export interface CategoryListQuery {
  status?: CategoryStatus;
  search?: string;
  parentId?: CategoryId | null;
}

export interface CategoryResponse {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  parentId: CategoryId | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryListResponse {
  count: number;
  results: CategoryResponse[];
}

export function isCategoryStatus(value: string): value is CategoryStatus {
  return (CATEGORY_STATUSES as readonly string[]).includes(value);
}
