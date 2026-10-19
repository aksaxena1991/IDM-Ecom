import { Router } from 'express';

import { CategoryController } from '../controllers/category.controller.js';
import { CategoryEventBus } from '../events/category.event.js';
import { InMemoryCategoryRepository } from '../models/category.model.js';
import { CategoryService } from '../services/category.service.js';

const repository = new InMemoryCategoryRepository();
const events = new CategoryEventBus();
const service = new CategoryService(repository, events);
const controller = new CategoryController(service);

export const categoryRouter = Router();

categoryRouter.get('/', controller.list);
categoryRouter.post('/', controller.create);
categoryRouter.get('/:id', controller.getById);
categoryRouter.patch('/:id', controller.update);
categoryRouter.delete('/:id', controller.remove);

export { events as categoryEventBus, repository as categoryRepository, service as categoryService };
