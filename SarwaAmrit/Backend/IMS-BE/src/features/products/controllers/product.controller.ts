import type { Request, Response } from 'express';

import { parseUuidParam } from '../../../shared/http/parse-params.js';
import { ProductValidationError } from '../aggregates/product.aggregate.js';
import { ProductService } from '../services/product.service.js';
import type {
  CreateProductPayload,
  ProductListQuery,
  ProductStatus,
  UpdateProductPayload,
} from '../types/product.type.js';
import { isProductStatus } from '../types/product.type.js';
import { toProductListResponse, toProductResponse } from '../views/product.view.js';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseListQuery(req.query);
    const products = await this.service.list(query);
    res.json(toProductListResponse(products));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const product = await this.service.getById(id);
    if (!product) {
      res.status(404).json({ detail: 'Product was not found.' });
      return;
    }
    res.json(toProductResponse(product));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const payload = normalizeCreatePayload(req.body);
    const product = await this.service.create(payload);
    res.status(201).json(toProductResponse(product));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeUpdatePayload(req.body);
    const product = await this.service.update(id, payload);
    res.json(toProductResponse(product));
  };

  replace = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    const payload = normalizeCreatePayload(req.body);
    const product = await this.service.replace(id, payload);
    res.json(toProductResponse(product));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = parseUuidParam(String(req.params.id));
    await this.service.delete(id);
    res.status(204).send();
  };
}

function parseListQuery(query: Request['query']): ProductListQuery {
  const result: ProductListQuery = {};

  if (typeof query.status === 'string' && isProductStatus(query.status)) {
    result.status = query.status;
  } else if (query.status !== undefined) {
    throw new ProductValidationError('Invalid product status filter.');
  }

  if (typeof query.search === 'string' && query.search.trim()) {
    result.search = query.search.trim();
  }

  if (typeof query.categoryId === 'string' && query.categoryId.trim()) {
    result.categoryId = parseUuidParam(query.categoryId, 'categoryId');
  }

  if (typeof query.brandId === 'string' && query.brandId.trim()) {
    result.brandId = parseUuidParam(query.brandId, 'brandId');
  }

  if (query.isFeatured === 'true') {
    result.isFeatured = true;
  } else if (query.isFeatured === 'false') {
    result.isFeatured = false;
  } else if (query.isFeatured !== undefined) {
    throw new ProductValidationError('isFeatured filter must be true or false.');
  }

  return result;
}

function normalizeCreatePayload(body: unknown): CreateProductPayload {
  if (!body || typeof body !== 'object') {
    throw new ProductValidationError('Request body is required.');
  }

  const record = body as Record<string, unknown>;
  const name = readString(record.name);
  if (!name?.trim()) {
    throw new ProductValidationError('Name is required.');
  }

  const categoryId = readString(record.categoryId ?? record.category_id);
  if (!categoryId) {
    throw new ProductValidationError('categoryId is required.');
  }

  return {
    name: name.trim(),
    slug: readString(record.slug)?.trim() ?? '',
    shortDescription: readNullableString(record.shortDescription ?? record.short_description),
    description: readNullableString(record.description),
    categoryId: parseUuidParam(categoryId, 'categoryId'),
    brandId: readNullableUuid(record.brandId ?? record.brand_id),
    status: readStatus(record.status) ?? 'DRAFT',
    isFeatured: readOptionalBoolean(record.isFeatured ?? record.is_featured),
    metaTitle: readNullableString(record.metaTitle ?? record.meta_title),
    metaDescription: readNullableString(record.metaDescription ?? record.meta_description),
  };
}

function normalizeUpdatePayload(body: unknown): UpdateProductPayload {
  if (!body || typeof body !== 'object') {
    throw new ProductValidationError('Request body is required.');
  }

  const record = body as Record<string, unknown>;
  const payload: UpdateProductPayload = {};

  if (record.name !== undefined) {
    payload.name = readString(record.name)?.trim() ?? '';
  }
  if (record.slug !== undefined) {
    payload.slug = readString(record.slug)?.trim() ?? '';
  }
  if (record.shortDescription !== undefined || record.short_description !== undefined) {
    payload.shortDescription = readNullableString(
      record.shortDescription ?? record.short_description,
    );
  }
  if (record.description !== undefined) {
    payload.description = readNullableString(record.description);
  }
  if (record.categoryId !== undefined || record.category_id !== undefined) {
    const categoryId = readString(record.categoryId ?? record.category_id);
    if (!categoryId) {
      throw new ProductValidationError('categoryId is invalid.');
    }
    payload.categoryId = parseUuidParam(categoryId, 'categoryId');
  }
  if (record.brandId !== undefined || record.brand_id !== undefined) {
    payload.brandId = readNullableUuid(record.brandId ?? record.brand_id);
  }
  if (record.status !== undefined) {
    payload.status = readStatus(record.status);
  }
  if (record.isFeatured !== undefined || record.is_featured !== undefined) {
    payload.isFeatured = readOptionalBoolean(record.isFeatured ?? record.is_featured);
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
    throw new ProductValidationError('At least one field is required to update.');
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
  throw new ProductValidationError('Request body contains invalid field types.');
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const text = readString(value);
  if (text === undefined) {
    throw new ProductValidationError('Request body contains invalid field types.');
  }
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNullableUuid(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  const id = readString(value);
  if (!id) {
    throw new ProductValidationError('Request body contains invalid field types.');
  }
  return parseUuidParam(id, 'brandId');
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
  throw new ProductValidationError('Request body contains invalid field types.');
}

function readStatus(value: unknown): ProductStatus | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const status = readString(value);
  if (!status || !isProductStatus(status)) {
    throw new ProductValidationError('Invalid product status.');
  }
  return status;
}
