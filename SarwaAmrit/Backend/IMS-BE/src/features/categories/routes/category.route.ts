import { Router } from 'express';

import { CategoryController } from '../controllers/category.controller.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { CategoryService } from '../services/category.service.js';

export function createCategoryRouter(service: CategoryService): Router {
  const controller = new CategoryController(service);
  const router = Router();

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.put('/:id', asyncHandler(controller.replace));
  router.patch('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));

  return router;
}
