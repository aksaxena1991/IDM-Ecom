import { Router } from 'express';

import { asyncHandler } from '../../../shared/http/async-handler.js';
import { ProductController } from '../controllers/product.controller.js';
import type { ProductService } from '../services/product.service.js';

export function createProductRouter(service: ProductService): Router {
  const controller = new ProductController(service);
  const router = Router();

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.put('/:id', asyncHandler(controller.replace));
  router.patch('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));

  return router;
}
