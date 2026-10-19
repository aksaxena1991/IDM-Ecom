import { CategoryValidationError } from '../../features/categories/aggregates/category.aggregate.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUuidParam(value: string, label = 'id'): string {
  const id = value.trim();
  if (!UUID_PATTERN.test(id)) {
    throw new CategoryValidationError(`Invalid ${label}.`);
  }
  return id;
}
