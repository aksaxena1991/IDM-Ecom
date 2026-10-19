import type { CategoryId } from '../types/category.type.js';

export type CategoryEvent =
  | { type: 'category.created'; categoryId: CategoryId }
  | { type: 'category.updated'; categoryId: CategoryId }
  | { type: 'category.deleted'; categoryId: CategoryId };

export type CategoryEventHandler = (event: CategoryEvent) => void;

export class CategoryEventBus {
  private readonly handlers: CategoryEventHandler[] = [];

  subscribe(handler: CategoryEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }

  publish(event: CategoryEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
