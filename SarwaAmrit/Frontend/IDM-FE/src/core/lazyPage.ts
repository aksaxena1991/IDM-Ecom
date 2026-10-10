import { lazy, type ComponentType } from 'react'

/** Named-export modules for `React.lazy` route/component code splitting. */
export function lazyPage<P>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string,
) {
  return lazy(async () => {
    const mod = await loader()
    return { default: mod[exportName] }
  })
}
