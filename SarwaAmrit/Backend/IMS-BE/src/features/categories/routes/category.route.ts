import { Router } from 'express';

import { CategoryController } from '../controllers/category.controller.js';
import type { CategoryService } from '../services/category.service.js';

export function createCategoryRouter(service: CategoryService): Router {
  const controller = new CategoryController(service);
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
