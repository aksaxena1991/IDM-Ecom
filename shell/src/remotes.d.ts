declare module 'idm/mount' {
  export type IdmMountOptions = {
    basename?: string
  }
  export function mount(el: HTMLElement, options?: IdmMountOptions): () => void
  export function unmount(): void
  const defaultMount: typeof mount
  export default defaultMount
}

declare module 'idm/IdmRoot' {
  import type { ComponentType } from 'react'
  const IdmRoot: ComponentType
  export default IdmRoot
}
