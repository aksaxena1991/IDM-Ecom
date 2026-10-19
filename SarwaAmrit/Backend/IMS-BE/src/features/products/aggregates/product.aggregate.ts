import { slugify } from '../../categories/aggregates/category.aggregate.js';
import { ProductEntity } from '../entities/product.entity.js';
import type { ProductRepository } from '../models/product.model.js';
import { newProductId } from '../models/product.model.js';
import type {
  CreateProductPayload,
  ProductId,
  ProductRecord,
  ProductStatus,
  UpdateProductPayload,
} from '../types/product.type.js';
import { isProductStatus } from '../types/product.type.js';

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class ProductConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductConflictError';
  }
}

export type ProductReferenceValidators = {
  categoryExists: (categoryId: string) => Promise<boolean>;
  brandExists: (brandId: string) => Promise<boolean>;
};

export class ProductAggregate {
  static async create(
    repository: ProductRepository,
    validators: ProductReferenceValidators,
    payload: CreateProductPayload,
  ): Promise<ProductEntity> {
    const name = payload.name.trim();
    if (!name) {
      throw new ProductValidationError('Name is required.');
    }

    const status = payload.status ?? 'DRAFT';
    assertStatus(status);

    await assertCategory(validators, payload.categoryId);
    await assertBrand(validators, payload.brandId ?? null);
    await assertUniqueNameInCategory(repository, payload.categoryId, name);

    const slug = await resolveUniqueSlug(
      repository,
      payload.slug.trim() || slugify(name),
    );

    const now = new Date();
    const record: ProductRecord = {
      id: newProductId(),
      name,
      slug,
      shortDescription: normalizeOptionalText(payload.shortDescription),
      description: normalizeOptionalText(payload.description),
      categoryId: payload.categoryId,
      brandId: payload.brandId ?? null,
      status,
      isFeatured: payload.isFeatured ?? false,
      metaTitle: normalizeOptionalText(payload.metaTitle),
      metaDescription: normalizeOptionalText(payload.metaDescription),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const saved = await repository.save(record);
    return new ProductEntity(saved);
  }

  static async update(
    repository: ProductRepository,
    validators: ProductReferenceValidators,
    id: ProductId,
    payload: UpdateProductPayload,
  ): Promise<ProductEntity> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw new ProductValidationError('Product was not found.');
    }

    const name = payload.name !== undefined ? payload.name.trim() : existing.name;
    if (!name) {
      throw new ProductValidationError('Name is required.');
    }

    const status = payload.status ?? existing.status;
    assertStatus(status);

    const categoryId =
      payload.categoryId !== undefined ? payload.categoryId : existing.categoryId;
    await assertCategory(validators, categoryId);

    const brandId =
      payload.brandId !== undefined ? payload.brandId : existing.brandId;
    await assertBrand(validators, brandId);

    const slugSource =
      payload.slug !== undefined
        ? payload.slug.trim() || slugify(name)
        : payload.name !== undefined
          ? slugify(name)
          : existing.slug;
    const slug = await resolveUniqueSlug(repository, slugSource, id);

    await assertUniqueNameInCategory(repository, categoryId, name, id);

    const updated: ProductRecord = {
      ...existing,
      name,
      slug,
      shortDescription:
        payload.shortDescription !== undefined
          ? normalizeOptionalText(payload.shortDescription)
          : existing.shortDescription,
      description:
        payload.description !== undefined
          ? normalizeOptionalText(payload.description)
          : existing.description,
      categoryId,
      brandId,
      status,
      isFeatured: payload.isFeatured ?? existing.isFeatured,
      metaTitle:
        payload.metaTitle !== undefined
          ? normalizeOptionalText(payload.metaTitle)
          : existing.metaTitle,
      metaDescription:
        payload.metaDescription !== undefined
          ? normalizeOptionalText(payload.metaDescription)
          : existing.metaDescription,
      updatedAt: new Date(),
    };

    const saved = await repository.save(updated);
    return new ProductEntity(saved);
  }
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertStatus(status: ProductStatus): void {
  if (!isProductStatus(status)) {
    throw new ProductValidationError('Invalid product status.');
  }
}

async function assertCategory(
  validators: ProductReferenceValidators,
  categoryId: string,
): Promise<void> {
  if (!(await validators.categoryExists(categoryId))) {
    throw new ProductValidationError('Category was not found.');
  }
}

async function assertBrand(
  validators: ProductReferenceValidators,
  brandId: string | null,
): Promise<void> {
  if (brandId === null) {
    return;
  }
  if (!(await validators.brandExists(brandId))) {
    throw new ProductValidationError('Brand was not found.');
  }
}

async function assertUniqueNameInCategory(
  repository: ProductRepository,
  categoryId: string,
  name: string,
  excludeId?: ProductId,
): Promise<void> {
  const existing = await repository.findByNameInCategory(categoryId, name);
  if (existing && existing.id !== excludeId) {
    throw new ProductConflictError(
      'Product name must be unique within this category.',
    );
  }
}

async function resolveUniqueSlug(
  repository: ProductRepository,
  preferred: string,
  excludeId?: ProductId,
): Promise<string> {
  const base = slugify(preferred);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await repository.findBySlug(candidate);
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
