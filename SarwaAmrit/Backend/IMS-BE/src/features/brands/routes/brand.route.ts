import { Router } from 'express';

import { asyncHandler } from '../../../shared/http/async-handler.js';
import { BrandController } from '../controllers/brand.controller.js';
import type { BrandService } from '../services/brand.service.js';

export function createBrandRouter(service: BrandService): Router {
  const controller = new BrandController(service);
  const router = Router();

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.put('/:id', asyncHandler(controller.replace));
  router.patch('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));

  return router;
}
