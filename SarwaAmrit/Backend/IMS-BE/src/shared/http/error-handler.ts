import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

import {
  CategoryConflictError,
  CategoryValidationError,
} from '../../features/categories/aggregates/category.aggregate.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ detail: 'A record with this unique value already exists.' });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ detail: 'Record was not found.' });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ detail: 'Internal server error.' });
}
