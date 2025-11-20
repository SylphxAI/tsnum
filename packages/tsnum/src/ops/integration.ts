// ===== Numerical Integration =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Integrate using trapezoidal rule
 * Computes the definite integral using the composite trapezoidal rule
 */
export function trapz<T extends DType>(y: NDArray<T>, x?: NDArray<T>, dx = 1.0): number {
  const yData = y.getData()

  if (yData.shape.length !== 1) {
    throw new Error('trapz only supports 1D arrays')
  }

  const n = yData.buffer.length

  if (n < 2) {
    return 0
  }

  if (x === undefined) {
    // Use uniform spacing dx
    let sum = 0

    // Trapezoidal rule: sum = dx * (y[0]/2 + y[1] + y[2] + ... + y[n-1]/2)
    sum += yData.buffer[0] / 2
    for (let i = 1; i < n - 1; i++) {
      sum += yData.buffer[i]
    }
    sum += yData.buffer[n - 1] / 2

    return sum * dx
  }

  // Use provided x values
  const xData = x.getData()

  if (xData.shape.length !== 1 || xData.buffer.length !== n) {
    throw new Error('x and y must be 1D arrays of same length')
  }

  let sum = 0

  // Trapezoidal rule with variable spacing
  for (let i = 0; i < n - 1; i++) {
    const dx = xData.buffer[i + 1] - xData.buffer[i]
    sum += dx * (yData.buffer[i] + yData.buffer[i + 1]) / 2
  }

  return sum
}

/**
 * Cumulative trapezoidal integration
 * Returns array of cumulative integrals
 */
export function cumtrapz<T extends DType>(
  y: NDArray<T>,
  x?: NDArray<T>,
  dx = 1.0,
  initial = 0,
): NDArray<T> {
  const yData = y.getData()

  if (yData.shape.length !== 1) {
    throw new Error('cumtrapz only supports 1D arrays')
  }

  const n = yData.buffer.length

  if (n < 2) {
    const result = createTypedArray(1, yData.dtype)
    result[0] = initial
    return new NDArray({
      buffer: result,
      shape: [1],
      strides: [1],
      dtype: yData.dtype,
    })
  }

  const result = createTypedArray(n, yData.dtype)
  result[0] = initial

  if (x === undefined) {
    // Use uniform spacing dx
    for (let i = 1; i < n; i++) {
      const trapArea = dx * (yData.buffer[i - 1] + yData.buffer[i]) / 2
      result[i] = result[i - 1] + trapArea
    }
  } else {
    // Use provided x values
    const xData = x.getData()

    if (xData.shape.length !== 1 || xData.buffer.length !== n) {
      throw new Error('x and y must be 1D arrays of same length')
    }

    for (let i = 1; i < n; i++) {
      const dx = xData.buffer[i] - xData.buffer[i - 1]
      const trapArea = dx * (yData.buffer[i - 1] + yData.buffer[i]) / 2
      result[i] = result[i - 1] + trapArea
    }
  }

  return new NDArray({
    buffer: result,
    shape: [...yData.shape],
    strides: [...yData.strides],
    dtype: yData.dtype,
  })
}
