import { CategoryEntity } from '../entities/category.entity.js';
import type { CategoryRepository } from '../models/category.model.js';
import { newCategoryId } from '../models/category.model.js';
import type {
  CategoryId,
  CategoryRecord,
  CategoryStatus,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';
import { isCategoryStatus } from '../types/category.type.js';

export class CategoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryValidationError';
  }
}

export class CategoryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryConflictError';
  }
}

export class CategoryAggregate {
  static async create(
    repository: CategoryRepository,
    payload: CreateCategoryPayload,
  ): Promise<CategoryEntity> {
    const name = payload.name.trim();
    if (!name) {
      throw new CategoryValidationError('Name is required.');
    }

    assertStatus(payload.status);

    const parentId = payload.parentId ?? null;
    if (parentId !== null) {
      const parent = await repository.findById(parentId);
      if (!parent) {
        throw new CategoryValidationError('Parent category was not found.');
      }
    }

    await assertUniqueName(repository, name);

    const slugInput = payload.slug.trim() || slugify(name);
    const slug = await resolveUniqueSlug(repository, slugInput);
    const now = new Date();
    const record: CategoryRecord = {
      id: newCategoryId(),
      name,
      slug,
      description: payload.description.trim(),
      status: payload.status,
      parentId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const saved = await repository.save(record);
    return new CategoryEntity(saved);
  }

  static async update(
    repository: CategoryRepository,
    id: CategoryId,
    payload: UpdateCategoryPayload,
  ): Promise<CategoryEntity> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw new CategoryValidationError('Category was not found.');
    }

    const name = payload.name !== undefined ? payload.name.trim() : existing.name;
    if (!name) {
      throw new CategoryValidationError('Name is required.');
    }

    const status = payload.status ?? existing.status;
    assertStatus(status);

    const parentId =
      payload.parentId !== undefined ? payload.parentId : existing.parentId;

    if (parentId === id) {
      throw new CategoryValidationError('A category cannot be its own parent.');
    }

    if (parentId !== null) {
      const parent = await repository.findById(parentId);
      if (!parent) {
        throw new CategoryValidationError('Parent category was not found.');
      }
      await assertNoParentCycle(repository, id, parentId);
    }

    const slugSource =
      payload.slug !== undefined
        ? payload.slug.trim() || slugify(name)
        : payload.name !== undefined
          ? slugify(name)
          : existing.slug;

    const slug = await resolveUniqueSlug(repository, slugSource, id);

    await assertUniqueName(repository, name, id);

    const updated: CategoryRecord = {
      ...existing,
      name,
      slug,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : existing.description,
      status,
      parentId,
      updatedAt: new Date(),
    };

    const saved = await repository.save(updated);
    return new CategoryEntity(saved);
  }
}

function assertStatus(status: CategoryStatus): void {
  if (!isCategoryStatus(status)) {
    throw new CategoryValidationError('Invalid category status.');
  }
}

async function assertNoParentCycle(
  repository: CategoryRepository,
  categoryId: CategoryId,
  parentId: CategoryId,
): Promise<void> {
  const seen = new Set<CategoryId>();
  let cursor: CategoryId | null = parentId;

  while (cursor !== null) {
    if (cursor === categoryId || seen.has(cursor)) {
      throw new CategoryValidationError('Category parent would create a cycle.');
    }
    seen.add(cursor);
    const node = await repository.findById(cursor);
    cursor = node?.parentId ?? null;
  }
}

async function assertUniqueName(
  repository: CategoryRepository,
  name: string,
  excludeId?: CategoryId,
): Promise<void> {
  const existing = await repository.findByName(name);
  if (existing && existing.id !== excludeId) {
    throw new CategoryConflictError('Category name must be unique.');
  }
}

async function resolveUniqueSlug(
  repository: CategoryRepository,
  preferred: string,
  excludeId?: CategoryId,
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

export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 140) || 'category'
  );
}
