import type { AxisOptions } from '../core/types'
import type { NDArray } from '../ndarray'

// ===== Reduction Operations (Pure Functions) =====

export function sum(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const data = a.getData()
    let total = 0
    for (let i = 0; i < data.buffer.length; i++) {
      total += data.buffer[i]
    }
    return total
  }
  throw new Error('Axis reduction not yet implemented')
}

export function mean(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const total = sum(a) as number
    return total / a.size
  }
  throw new Error('Axis reduction not yet implemented')
}

export function max(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const data = a.getData()
    let maxVal = Number.NEGATIVE_INFINITY
    for (let i = 0; i < data.buffer.length; i++) {
      maxVal = Math.max(maxVal, data.buffer[i])
    }
    return maxVal
  }
  throw new Error('Axis reduction not yet implemented')
}

export function min(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const data = a.getData()
    let minVal = Number.POSITIVE_INFINITY
    for (let i = 0; i < data.buffer.length; i++) {
      minVal = Math.min(minVal, data.buffer[i])
    }
    return minVal
  }
  throw new Error('Axis reduction not yet implemented')
}

export function std(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const m = mean(a) as number
    const data = a.getData()
    let sumSquaredDiff = 0

    for (let i = 0; i < data.buffer.length; i++) {
      const diff = data.buffer[i] - m
      sumSquaredDiff += diff * diff
    }

    return Math.sqrt(sumSquaredDiff / data.buffer.length)
  }
  throw new Error('Axis reduction not yet implemented')
}

export function variance(a: NDArray, options?: AxisOptions): number | NDArray {
  if (options?.axis === undefined) {
    const s = std(a) as number
    return s * s
  }
  throw new Error('Axis reduction not yet implemented')
}
