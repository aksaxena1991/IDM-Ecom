export type CategoryId = string;

export interface CategoryRecord {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  parentId: CategoryId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: CategoryId | null;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: CategoryId | null;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  count: number;
  results: CategoryResponse[];
}
