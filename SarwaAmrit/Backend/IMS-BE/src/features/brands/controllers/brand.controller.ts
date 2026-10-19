import type { Request, Response } from 'express';

import { parseUuidParam } from '../../../shared/http/parse-params.js';
import { BrandValidationError } from '../aggregates/brand.aggregate.js';
import { BrandService } from '../services/brand.service.js';
import type {
  BrandListQuery,
  BrandStatus,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '../types/brand.type.js';
import { isBrandStatus } from '../types/brand.type.js';
import { toBrandListResponse, toBrandResponse } from '../views/brand.view.js';

export class BrandController {
  constructor(private readonly service: BrandService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseListQuery(req.query);
    const brands = await this.service.list(query);
    res.json(toBrandListResponse(brands));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const brand = await this.service.getById(id);
    if (!brand) {
      res.status(404).json({ detail: 'Brand was not found.' });
      return;
    }
    res.json(toBrandResponse(brand));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const payload = normalizeCreatePayload(req.body);
    const brand = await this.service.create(payload);
    res.status(201).json(toBrandResponse(brand));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeUpdatePayload(req.body);
    const brand = await this.service.update(id, payload);
    res.json(toBrandResponse(brand));
  };

  replace = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeCreatePayload(req.body);
    const brand = await this.service.replace(id, payload);
    res.json(toBrandResponse(brand));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    await this.service.delete(id);
    res.status(204).send();
  };
}

function parseListQuery(query: Request['query']): BrandListQuery {
  const result: BrandListQuery = {};

  if (typeof query.status === 'string' && isBrandStatus(query.status)) {
    result.status = query.status;
  } else if (query.status !== undefined) {
    throw new BrandValidationError('Invalid brand status filter.');
  }

  if (typeof query.search === 'string' && query.search.trim()) {
    result.search = query.search.trim();
  }

  if (query.isVerified === 'true') {
    result.isVerified = true;
  } else if (query.isVerified === 'false') {
    result.isVerified = false;
  } else if (query.isVerified !== undefined) {
    throw new BrandValidationError('Invalid isVerified filter.');
  }

  return result;
}

function normalizeCreatePayload(body: unknown): CreateBrandPayload {
  if (!body || typeof body !== 'object') {
    throw new BrandValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  const name = readString(record.name);
  if (!name?.trim()) {
    throw new BrandValidationError('Name is required.');
  }

  return {
    name: name.trim(),
    slug: readString(record.slug)?.trim() ?? '',
    code: readString(record.code)?.trim() ?? '',
    description: readNullableString(record.description),
    logoUrl: readNullableString(record.logoUrl ?? record.logo_url),
    bannerUrl: readNullableString(record.bannerUrl ?? record.banner_url),
    status: readStatus(record.status) ?? 'DRAFT',
    isVerified: readOptionalBoolean(record.isVerified ?? record.is_verified) ?? false,
    metaTitle: readNullableString(record.metaTitle ?? record.meta_title),
    metaDescription: readNullableString(
      record.metaDescription ?? record.meta_description,
    ),
  };
}

function normalizeUpdatePayload(body: unknown): UpdateBrandPayload {
  if (!body || typeof body !== 'object') {
    throw new BrandValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  const payload: UpdateBrandPayload = {};

  if (record.name !== undefined) {
    payload.name = readString(record.name)?.trim() ?? '';
  }
  if (record.slug !== undefined) {
    payload.slug = readString(record.slug)?.trim() ?? '';
  }
  if (record.code !== undefined) {
    payload.code = readString(record.code)?.trim() ?? '';
  }
  if (record.description !== undefined) {
    payload.description = readNullableString(record.description);
  }
  if (record.logoUrl !== undefined || record.logo_url !== undefined) {
    payload.logoUrl = readNullableString(record.logoUrl ?? record.logo_url);
  }
  if (record.bannerUrl !== undefined || record.banner_url !== undefined) {
    payload.bannerUrl = readNullableString(record.bannerUrl ?? record.banner_url);
  }
  if (record.status !== undefined) {
    payload.status = readStatus(record.status);
  }
  if (record.isVerified !== undefined || record.is_verified !== undefined) {
    payload.isVerified = readOptionalBoolean(record.isVerified ?? record.is_verified);
  }
  if (record.metaTitle !== undefined || record.meta_title !== undefined) {
    payload.metaTitle = readNullableString(record.metaTitle ?? record.meta_title);
  }
  if (record.metaDescription !== undefined || record.meta_description !== undefined) {
    payload.metaDescription = readNullableString(
      record.metaDescription ?? record.meta_description,
    );
  }

  if (Object.keys(payload).length === 0) {
    throw new BrandValidationError('At least one field is required to update.');
  }

  return payload;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  throw new BrandValidationError('Request body contains invalid field types.');
}

function readNullableString(value: unknown): string | null {
  if (value === undefined) {
    return null;
  }
  if (value === null) {
    return null;
  }
  const str = readString(value);
  if (str === undefined) {
    throw new BrandValidationError('Request body contains invalid field types.');
  }
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new BrandValidationError('Request body contains invalid field types.');
}

function readStatus(value: unknown): BrandStatus | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const status = readString(value);
  if (!status || !isBrandStatus(status)) {
    throw new BrandValidationError('Invalid brand status.');
  }
  return status;
}
