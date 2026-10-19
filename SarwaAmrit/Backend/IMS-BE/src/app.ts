import cors from 'cors';
import express, { type Express } from 'express';

import { CategoryEventBus } from './features/categories/events/category.event.js';
import { PrismaCategoryRepository } from './features/categories/models/prisma-category.repository.js';
import { createCategoryRouter } from './features/categories/routes/category.route.js';
import { CategoryService } from './features/categories/services/category.service.js';
import { prisma } from './infrastructure/database/prisma.js';
import { apiPrefix } from './shared/config/app.config.js';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/http/error-handler.js';

export type CreateAppOptions = {
  categoryService?: CategoryService;
};

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    }),
  );
  app.use(express.json({ limit: '256kb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'ims-be' });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'ims-be' });
    } catch {
      res.status(503).json({ status: 'unavailable', service: 'ims-be' });
    }
  });

  const categoryService =
    options.categoryService ??
    new CategoryService(
      new PrismaCategoryRepository(),
      new CategoryEventBus(),
      (categoryId) =>
        prisma.product.count({ where: { categoryId, deletedAt: null } }),
    );

  app.use(`${apiPrefix}/categories`, createCategoryRouter(categoryService));
  app.use(errorHandler);

  return app;
}
