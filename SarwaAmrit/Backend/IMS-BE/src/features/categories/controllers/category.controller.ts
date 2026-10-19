import type { Request, Response } from 'express';

import { CategoryService } from '../services/category.service.js';
import type {
  CategoryListQuery,
  CategoryStatus,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';
import { isCategoryStatus } from '../types/category.type.js';
import { CategoryValidationError } from '../aggregates/category.aggregate.js';
import { toCategoryListResponse, toCategoryResponse } from '../views/category.view.js';
import { parseUuidParam } from '../../../shared/http/parse-params.js';

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseListQuery(req.query);
    const categories = await this.service.list(query);
    res.json(toCategoryListResponse(categories));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const category = await this.service.getById(id);
    if (!category) {
      res.status(404).json({ detail: 'Category was not found.' });
      return;
    }
    res.json(toCategoryResponse(category));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const payload = normalizeCreatePayload(req.body);
    const category = await this.service.create(payload);
    res.status(201).json(toCategoryResponse(category));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeUpdatePayload(req.body);
    const category = await this.service.update(id, payload);
    res.json(toCategoryResponse(category));
  };

  replace = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeCreatePayload(req.body);
    const category = await this.service.replace(id, payload);
    res.json(toCategoryResponse(category));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    await this.service.delete(id);
    res.status(204).send();
  };
}

function parseListQuery(query: Request['query']): CategoryListQuery {
  const result: CategoryListQuery = {};

  if (typeof query.status === 'string' && isCategoryStatus(query.status)) {
    result.status = query.status;
  } else if (query.status !== undefined) {
    throw new CategoryValidationError('Invalid category status filter.');
  }

  if (typeof query.search === 'string' && query.search.trim()) {
    result.search = query.search.trim();
  }

  if (query.parentId === 'null' || query.parent_id === 'null') {
    result.parentId = null;
  } else if (typeof query.parentId === 'string' && query.parentId.trim()) {
    result.parentId = parseUuidParam(query.parentId, 'parentId');
  } else if (typeof query.parent_id === 'string' && query.parent_id.trim()) {
    result.parentId = parseUuidParam(query.parent_id, 'parentId');
  }

  return result;
}

function normalizeCreatePayload(body: unknown): CreateCategoryPayload {
  if (!body || typeof body !== 'object') {
    throw new CategoryValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  const name = readString(record.name);
  if (!name?.trim()) {
    throw new CategoryValidationError('Name is required.');
  }

  return {
    name: name.trim(),
    slug: readString(record.slug)?.trim() ?? '',
    description: readString(record.description)?.trim() ?? '',
    status: readStatus(record.status) ?? 'DRAFT',
    parentId: readNullableId(record.parentId ?? record.parent_id) ?? null,
  };
}

function normalizeUpdatePayload(body: unknown): UpdateCategoryPayload {
  if (!body || typeof body !== 'object') {
    throw new CategoryValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  const payload: UpdateCategoryPayload = {};

  if (record.name !== undefined) {
    payload.name = readString(record.name)?.trim() ?? '';
  }
  if (record.slug !== undefined) {
    payload.slug = readString(record.slug)?.trim() ?? '';
  }
  if (record.description !== undefined) {
    payload.description = readString(record.description)?.trim() ?? '';
  }
  if (record.status !== undefined) {
    payload.status = readStatus(record.status);
  }
  if (record.parentId !== undefined || record.parent_id !== undefined) {
    payload.parentId = readNullableId(record.parentId ?? record.parent_id) ?? null;
  }

  if (Object.keys(payload).length === 0) {
    throw new CategoryValidationError('At least one field is required to update.');
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
  throw new CategoryValidationError('Request body contains invalid field types.');
}

function readNullableId(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  const id = readString(value);
  if (id === undefined) {
    throw new CategoryValidationError('Request body contains invalid field types.');
  }
  return id;
}

function readStatus(value: unknown): CategoryStatus | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const status = readString(value);
  if (!status || !isCategoryStatus(status)) {
    throw new CategoryValidationError('Invalid category status.');
  }
  return status;
}
