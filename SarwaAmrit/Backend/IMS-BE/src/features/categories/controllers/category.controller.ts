import type { Request, Response } from 'express';

import {
  CategoryConflictError,
  CategoryService,
  CategoryValidationError,
} from '../services/category.service.js';
import type {
  CategoryStatus,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';
import { isCategoryStatus } from '../types/category.type.js';
import { toCategoryListResponse, toCategoryResponse } from '../views/category.view.js';

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.service.list();
    res.json(toCategoryListResponse(categories));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.getById(String(req.params.id));
    if (!category) {
      res.status(404).json({ detail: 'Category was not found.' });
      return;
    }
    res.json(toCategoryResponse(category));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = normalizeCreatePayload(req.body);
      const category = await this.service.create(payload);
      res.status(201).json(toCategoryResponse(category));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = normalizeUpdatePayload(req.body);
      const category = await this.service.update(String(req.params.id), payload);
      res.json(toCategoryResponse(category));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.delete(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown): void {
    if (error instanceof CategoryValidationError) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        detail: error.message,
      });
      return;
    }
    if (error instanceof CategoryConflictError) {
      res.status(409).json({ detail: error.message });
      return;
    }
    throw error;
  }
}

function normalizeCreatePayload(body: unknown): CreateCategoryPayload {
  if (!body || typeof body !== 'object') {
    throw new CategoryValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  return {
    name: readString(record.name) ?? '',
    slug: readString(record.slug) ?? '',
    description: readString(record.description) ?? '',
    status: readStatus(record.status) ?? 'DRAFT',
    parentId: readNullableId(record.parentId ?? record.parent_id) ?? null,
  };
}

function normalizeUpdatePayload(body: unknown): UpdateCategoryPayload {
  if (!body || typeof body !== 'object') {
    throw new CategoryValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  const status = readStatus(record.status);
  if (!status) {
    throw new CategoryValidationError('status is required.');
  }

  return {
    name: readString(record.name) ?? '',
    slug: readString(record.slug) ?? '',
    description: readString(record.description) ?? '',
    status,
    parentId: readNullableId(record.parentId ?? record.parent_id) ?? null,
  };
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
