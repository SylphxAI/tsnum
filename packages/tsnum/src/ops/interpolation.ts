// ===== Interpolation Functions =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * One-dimensional linear interpolation
 * Returns interpolated values at x from data points (xp, fp)
 */
export function interp<T extends DType>(
  x: NDArray<T>,
  xp: NDArray<T>,
  fp: NDArray<T>,
  left?: number,
  right?: number,
): NDArray<T> {
  const xData = x.getData()
  const xpData = xp.getData()
  const fpData = fp.getData()

  if (xData.shape.length !== 1) {
    throw new Error('interp requires 1D x array')
  }

  if (xpData.shape.length !== 1 || fpData.shape.length !== 1) {
    throw new Error('interp requires 1D xp and fp arrays')
  }

  if (xpData.buffer.length !== fpData.buffer.length) {
    throw new Error('xp and fp must have same length')
  }

  const result = createTypedArray(xData.buffer.length, xData.dtype)

  for (let i = 0; i < xData.buffer.length; i++) {
    const xi = xData.buffer[i]

    // Handle out of bounds
    if (xi < xpData.buffer[0]) {
      result[i] = left !== undefined ? left : fpData.buffer[0]
      continue
    }

    if (xi > xpData.buffer[xpData.buffer.length - 1]) {
      result[i] = right !== undefined ? right : fpData.buffer[fpData.buffer.length - 1]
      continue
    }

    // Find the interval [xp[j], xp[j+1]] containing xi
    let j = 0
    for (j = 0; j < xpData.buffer.length - 1; j++) {
      if (xi >= xpData.buffer[j] && xi <= xpData.buffer[j + 1]) {
        break
      }
    }

    // Linear interpolation
    const x0 = xpData.buffer[j]
    const x1 = xpData.buffer[j + 1]
    const y0 = fpData.buffer[j]
    const y1 = fpData.buffer[j + 1]

    if (x1 === x0) {
      result[i] = y0
    } else {
      const t = (xi - x0) / (x1 - x0)
      result[i] = y0 + t * (y1 - y0)
    }
  }

  return new NDArray({
    buffer: result,
    shape: [...xData.shape],
    strides: [...xData.strides],
    dtype: xData.dtype,
  })
}
