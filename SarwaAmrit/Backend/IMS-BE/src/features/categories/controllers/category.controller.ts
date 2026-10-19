import type { Request, Response } from 'express';

import {
  CategoryConflictError,
  CategoryService,
  CategoryValidationError,
} from '../services/category.service.js';
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category.type.js';
import { toCategoryListResponse, toCategoryResponse } from '../views/category.view.js';

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.service.list();
    res.json(
      await toCategoryListResponse(categories, (id) => this.service.productCount(id)),
    );
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.getById(String(req.params.id));
    if (!category) {
      res.status(404).json({ detail: 'Category was not found.' });
      return;
    }
    res.json(
      toCategoryResponse(category, await this.service.productCount(category.id)),
    );
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = normalizeCreatePayload(req.body);
      const category = await this.service.create(payload);
      res.status(201).json(
        toCategoryResponse(category, await this.service.productCount(category.id)),
      );
    } catch (error) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = normalizeUpdatePayload(req.body);
      const category = await this.service.update(String(req.params.id), payload);
      res.json(
        toCategoryResponse(category, await this.service.productCount(category.id)),
      );
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
    name: String(record.name ?? ''),
    slug: record.slug !== undefined ? String(record.slug) : undefined,
    description:
      record.description !== undefined ? String(record.description) : undefined,
    parentId: readNullableId(record.parent_id ?? record.parentId),
    isActive: readOptionalBoolean(record.is_active ?? record.isActive),
  };
}

function normalizeUpdatePayload(body: unknown): UpdateCategoryPayload {
  if (!body || typeof body !== 'object') {
    throw new CategoryValidationError('Request body is required.');
  }
  const record = body as Record<string, unknown>;
  return {
    name: record.name !== undefined ? String(record.name) : undefined,
    slug: record.slug !== undefined ? String(record.slug) : undefined,
    description:
      record.description !== undefined ? String(record.description) : undefined,
    parentId:
      record.parent_id !== undefined || record.parentId !== undefined
        ? readNullableId(record.parent_id ?? record.parentId)
        : undefined,
    isActive: readOptionalBoolean(record.is_active ?? record.isActive),
  };
}

function readNullableId(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  return String(value);
}

function readOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Boolean(value);
}
