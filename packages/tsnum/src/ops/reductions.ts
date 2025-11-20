import { getBackend } from '../backend/manager'
import type { AxisOptions } from '../core/types'

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

/**
 * Return the product of array elements
 */
export function prod(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis !== undefined) {
    throw new Error('Axis reduction not yet implemented')
  }

  const data = a.getData()
  let product = 1

  for (let i = 0; i < data.buffer.length; i++) {
    product *= data.buffer[i]
  }

  return product
}

/**
 * Return the product of array elements, ignoring NaN values
 */
export function nanprod(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis !== undefined) {
    throw new Error('Axis reduction not yet implemented')
  }

  const data = a.getData()
  let product = 1

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      product *= val
    }
  }

  return product
}

/**
 * Count the number of non-zero elements
 */
export function count_nonzero(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis !== undefined) {
    throw new Error('Axis reduction not yet implemented')
  }

  const data = a.getData()
  let count = 0

  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] !== 0) {
      count++
    }
  }

  return count
}
