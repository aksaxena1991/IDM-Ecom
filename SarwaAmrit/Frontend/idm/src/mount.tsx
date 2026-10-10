import { createRoot, type Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import IdmRoot from './IdmRoot'

let root: Root | null = null

export type IdmMountOptions = {
  basename?: string
}

/**
 * Runtime mount for Module Federation hosts that do not share React
 * with this remote (typical with two Vite 8 / React 19 apps).
 */
export function mount(el: HTMLElement, options: IdmMountOptions = {}) {
  unmount()
  root = createRoot(el)
  root.render(
    <BrowserRouter basename={options.basename}>
      <IdmRoot />
    </BrowserRouter>,
  )
  return unmount
}

export function unmount() {
  root?.unmount()
  root = null
}

export default mount
