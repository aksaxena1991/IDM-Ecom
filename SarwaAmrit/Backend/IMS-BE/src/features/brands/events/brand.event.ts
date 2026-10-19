import type { BrandId } from '../types/brand.type.js';

export type BrandEvent =
  | { type: 'brand.created'; brandId: BrandId }
  | { type: 'brand.updated'; brandId: BrandId }
  | { type: 'brand.deleted'; brandId: BrandId };

export type BrandEventHandler = (event: BrandEvent) => void;

export class BrandEventBus {
  private readonly handlers: BrandEventHandler[] = [];

  subscribe(handler: BrandEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }

  publish(event: BrandEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
