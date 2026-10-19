import cors from 'cors';
import express, { type Express } from 'express';

import { BrandEventBus } from './features/brands/events/brand.event.js';
import { PrismaBrandRepository } from './features/brands/models/prisma-brand.repository.js';
import { createBrandRouter } from './features/brands/routes/brand.route.js';
import { BrandService } from './features/brands/services/brand.service.js';
import { CategoryEventBus } from './features/categories/events/category.event.js';
import { PrismaCategoryRepository } from './features/categories/models/prisma-category.repository.js';
import { createCategoryRouter } from './features/categories/routes/category.route.js';
import { CategoryService } from './features/categories/services/category.service.js';
import { ProductEventBus } from './features/products/events/product.event.js';
import { PrismaProductRepository } from './features/products/models/prisma-product.repository.js';
import { createProductRouter } from './features/products/routes/product.route.js';
import { ProductService } from './features/products/services/product.service.js';
import { prisma } from './infrastructure/database/prisma.js';
import { apiPrefix } from './shared/config/app.config.js';
import { env } from './shared/config/env.js';
import { setupSwagger } from './openapi/setup-swagger.js';
import { errorHandler } from './shared/http/error-handler.js';

export type CreateAppOptions = {
  categoryService?: CategoryService;
  brandService?: BrandService;
  productService?: ProductService;
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

  const brandService =
    options.brandService ??
    new BrandService(
      new PrismaBrandRepository(),
      new BrandEventBus(),
      (brandId) =>
        prisma.product.count({ where: { brandId, deletedAt: null } }),
    );

  const productService =
    options.productService ??
    new ProductService(
      new PrismaProductRepository(),
      new ProductEventBus(),
      {
        categoryExists: async (categoryId) =>
          !!(await prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null },
          })),
        brandExists: async (brandId) =>
          !!(await prisma.brand.findFirst({
            where: { id: brandId, deletedAt: null },
          })),
      },
    );

  app.use(`${apiPrefix}/categories`, createCategoryRouter(categoryService));
  app.use(`${apiPrefix}/brands`, createBrandRouter(brandService));
  app.use(`${apiPrefix}/products`, createProductRouter(productService));

  setupSwagger(app);

  app.use(errorHandler);

  return app;
}
