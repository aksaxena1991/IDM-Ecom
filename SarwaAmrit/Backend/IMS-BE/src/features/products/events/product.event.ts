import type { ProductId } from '../types/product.type.js';

export type ProductEvent =
  | { type: 'product.created'; productId: ProductId }
  | { type: 'product.updated'; productId: ProductId }
  | { type: 'product.deleted'; productId: ProductId };

export type ProductEventHandler = (event: ProductEvent) => void;

export class ProductEventBus {
  private readonly handlers: ProductEventHandler[] = [];

  subscribe(handler: ProductEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }

  publish(event: ProductEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
