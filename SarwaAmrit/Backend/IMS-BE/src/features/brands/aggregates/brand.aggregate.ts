import { slugify } from '../../categories/aggregates/category.aggregate.js';
import { BrandEntity } from '../entities/brand.entity.js';
import type { BrandRepository } from '../models/brand.model.js';
import { newBrandId } from '../models/brand.model.js';
import type {
  BrandId,
  BrandRecord,
  BrandStatus,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '../types/brand.type.js';
import { isBrandStatus } from '../types/brand.type.js';

export class BrandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrandValidationError';
  }
}

export class BrandConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrandConflictError';
  }
}

export class BrandAggregate {
  static async create(
    repository: BrandRepository,
    payload: CreateBrandPayload,
  ): Promise<BrandEntity> {
    const name = payload.name.trim();
    if (!name) {
      throw new BrandValidationError('Name is required.');
    }

    assertStatus(payload.status);

    const slugInput = payload.slug.trim() || slugifyBrand(name);
    const slug = await resolveUniqueSlug(repository, slugInput);

    const codeInput = payload.code.trim() || brandCodeFromName(name);
    const code = await resolveUniqueCode(repository, codeInput);

    const isVerified = payload.isVerified ?? false;
    const now = new Date();
    const record: BrandRecord = {
      id: newBrandId(),
      name,
      slug,
      code,
      description: normalizeOptionalText(payload.description),
      logoUrl: normalizeOptionalUrl(payload.logoUrl),
      bannerUrl: normalizeOptionalUrl(payload.bannerUrl),
      status: payload.status,
      isVerified,
      verifiedAt: isVerified ? now : null,
      metaTitle: normalizeOptionalText(payload.metaTitle),
      metaDescription: normalizeOptionalText(payload.metaDescription),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const saved = await repository.save(record);
    return new BrandEntity(saved);
  }

  static async update(
    repository: BrandRepository,
    id: BrandId,
    payload: UpdateBrandPayload,
  ): Promise<BrandEntity> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw new BrandValidationError('Brand was not found.');
    }

    const name = payload.name !== undefined ? payload.name.trim() : existing.name;
    if (!name) {
      throw new BrandValidationError('Name is required.');
    }

    const status = payload.status ?? existing.status;
    assertStatus(status);

    const slugSource =
      payload.slug !== undefined
        ? payload.slug.trim() || slugifyBrand(name)
        : payload.name !== undefined
          ? slugifyBrand(name)
          : existing.slug;

    const slug = await resolveUniqueSlug(repository, slugSource, id);

    const codeSource =
      payload.code !== undefined
        ? payload.code.trim() || brandCodeFromName(name)
        : payload.name !== undefined
          ? brandCodeFromName(name)
          : existing.code;

    const code = await resolveUniqueCode(repository, codeSource, id);

    let isVerified = payload.isVerified ?? existing.isVerified;
    let verifiedAt = existing.verifiedAt;

    if (payload.isVerified !== undefined) {
      isVerified = payload.isVerified;
      if (isVerified && !existing.isVerified) {
        verifiedAt = new Date();
      } else if (!isVerified) {
        verifiedAt = null;
      }
    }

    const updated: BrandRecord = {
      ...existing,
      name,
      slug,
      code,
      description:
        payload.description !== undefined
          ? normalizeOptionalText(payload.description)
          : existing.description,
      logoUrl:
        payload.logoUrl !== undefined
          ? normalizeOptionalUrl(payload.logoUrl)
          : existing.logoUrl,
      bannerUrl:
        payload.bannerUrl !== undefined
          ? normalizeOptionalUrl(payload.bannerUrl)
          : existing.bannerUrl,
      status,
      isVerified,
      verifiedAt,
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
    return new BrandEntity(saved);
  }
}

function assertStatus(status: BrandStatus): void {
  if (!isBrandStatus(status)) {
    throw new BrandValidationError('Invalid brand status.');
  }
}

function slugifyBrand(value: string): string {
  const base = slugify(value);
  return base === 'category' ? 'brand' : base.slice(0, 180);
}

export function brandCodeFromName(value: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return normalized || 'BRAND';
}

async function resolveUniqueSlug(
  repository: BrandRepository,
  preferred: string,
  excludeId?: BrandId,
): Promise<string> {
  const base = slugifyBrand(preferred);
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

async function resolveUniqueCode(
  repository: BrandRepository,
  preferred: string,
  excludeId?: BrandId,
): Promise<string> {
  const base = brandCodeFromName(preferred);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await repository.findByCode(candidate);
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    const suffixStr = `_${suffix}`;
    candidate = `${base.slice(0, Math.max(1, 80 - suffixStr.length))}${suffixStr}`;
    suffix += 1;
  }
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalUrl(value: string | null | undefined): string | null {
  return normalizeOptionalText(value);
}
