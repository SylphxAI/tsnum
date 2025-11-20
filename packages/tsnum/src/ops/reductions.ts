import { getBackend } from '../backend/manager'
import type { AxisOptions } from '../core/types'
import type { NDArray } from '../ndarray'

// ===== Reduction Operations (Pure Functions) =====
// Delegated to backend (WASM or TypeScript)

export function sum(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.sum(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}

export function mean(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.mean(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}

export function max(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.max(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}

export function min(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.min(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}

export function std(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.std(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}

export function variance(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const backend = getBackend()
    return backend.variance(a.getData())
  }
  throw new Error('Axis reduction not yet implemented')
}
