// ===== Advanced Statistics =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'
import { mean } from './reductions'

/**
 * Compute the median (50th percentile)
 */
export function median<T extends DType>(a: NDArray<T>): number {
  return percentile(a, 50)
}

/**
 * Compute the q-th percentile
 */
export function percentile<T extends DType>(a: NDArray<T>, q: number): number {
  if (q < 0 || q > 100) {
    throw new Error('Percentile must be between 0 and 100')
  }

  const data = a.getData()

  // Sort the data
  const sorted = Array.from(data.buffer).sort((a, b) => a - b)

  if (sorted.length === 0) {
    return 0
  }

  if (sorted.length === 1) {
    return sorted[0]
  }

  // Linear interpolation
  const index = (q / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

/**
 * Compute the quantile (equivalent to percentile but with q in [0, 1])
 */
export function quantile<T extends DType>(a: NDArray<T>, q: number): number {
  if (q < 0 || q > 1) {
    throw new Error('Quantile must be between 0 and 1')
  }

  return percentile(a, q * 100)
}

/**
 * Compute correlation coefficient matrix
 */
export function corrcoef<T extends DType>(a: NDArray<T>, b?: NDArray<T>): NDArray<T> {
  const aData = a.getData()

  if (aData.shape.length !== 1) {
    throw new Error('corrcoef only supports 1D arrays for now')
  }

  if (b === undefined) {
    // Auto-correlation (always 1)
    const buffer = createTypedArray(1, aData.dtype)
    buffer[0] = 1
    return new NDArrayImpl({
      buffer,
      shape: [1],
      strides: [1],
      dtype: aData.dtype,
    })
  }

  const bData = b.getData()

  if (bData.shape.length !== 1 || aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must be 1D and have same length')
  }

  // Compute correlation coefficient
  const n = aData.buffer.length
  const aMean = mean(a) as number
  const bMean = mean(b) as number

  let numerator = 0
  let aSumSq = 0
  let bSumSq = 0

  for (let i = 0; i < n; i++) {
    const aDiff = Number(aData.buffer[i]) - aMean
    const bDiff = Number(bData.buffer[i]) - bMean

    numerator += aDiff * bDiff
    aSumSq += aDiff * aDiff
    bSumSq += bDiff * bDiff
  }

  const correlation = numerator / Math.sqrt(aSumSq * bSumSq)

  // Return 2x2 correlation matrix
  const buffer = createTypedArray(4, aData.dtype)
  buffer[0] = 1 // corr(a, a)
  buffer[1] = correlation // corr(a, b)
  buffer[2] = correlation // corr(b, a)
  buffer[3] = 1 // corr(b, b)

  return new NDArrayImpl({
    buffer,
    shape: [2, 2],
    strides: [2, 1],
    dtype: aData.dtype,
  })
}

/**
 * Compute covariance matrix
 */
export function cov<T extends DType>(a: NDArray<T>, b?: NDArray<T>): NDArray<T> {
  const aData = a.getData()

  if (aData.shape.length !== 1) {
    throw new Error('cov only supports 1D arrays for now')
  }

  const n = aData.buffer.length
  const aMean = mean(a) as number

  if (b === undefined) {
    // Variance of a
    let sum = 0
    for (let i = 0; i < n; i++) {
      const diff = Number(aData.buffer[i]) - aMean
      sum += diff * diff
    }
    const variance = sum / (n - 1) // Sample variance (n-1)

    const buffer = createTypedArray(1, aData.dtype)
    buffer[0] = variance

    return new NDArrayImpl({
      buffer,
      shape: [1],
      strides: [1],
      dtype: aData.dtype,
    })
  }

  const bData = b.getData()

  if (bData.shape.length !== 1 || aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must be 1D and have same length')
  }

  const bMean = mean(b) as number

  // Compute covariances
  let covAB = 0
  let varA = 0
  let varB = 0

  for (let i = 0; i < n; i++) {
    const aDiff = Number(aData.buffer[i]) - aMean
    const bDiff = Number(bData.buffer[i]) - bMean

    covAB += aDiff * bDiff
    varA += aDiff * aDiff
    varB += bDiff * bDiff
  }

  covAB /= n - 1
  varA /= n - 1
  varB /= n - 1

  // Return 2x2 covariance matrix
  const buffer = createTypedArray(4, aData.dtype)
  buffer[0] = varA
  buffer[1] = covAB
  buffer[2] = covAB
  buffer[3] = varB

  return new NDArrayImpl({
    buffer,
    shape: [2, 2],
    strides: [2, 1],
    dtype: aData.dtype,
  })
}

/**
 * Compute histogram
 */
export function histogram<T extends DType>(
  a: NDArray<T>,
  bins = 10,
): { counts: NDArray<'int32'>; edges: NDArray<'float64'> } {
  const data = a.getData()

  // Find min and max
  let min = data.buffer[0]
  let max = data.buffer[0]

  for (let i = 1; i < data.buffer.length; i++) {
    if (data.buffer[i] < min) min = data.buffer[i]
    if (data.buffer[i] > max) max = data.buffer[i]
  }

  // Create bins
  const binWidth = (max - min) / bins
  const counts = new Int32Array(bins)
  const edges = new Float64Array(bins + 1)

  for (let i = 0; i <= bins; i++) {
    edges[i] = min + i * binWidth
  }

  // Count values in each bin
  for (let i = 0; i < data.buffer.length; i++) {
    const value = data.buffer[i]
    let binIdx = Math.floor((value - min) / binWidth)

    // Handle edge case where value === max
    if (binIdx >= bins) binIdx = bins - 1

    counts[binIdx]++
  }

  return {
    counts: new NDArrayImpl({
      buffer: counts,
      shape: [bins],
      strides: [1],
      dtype: 'int32',
    }),
    edges: new NDArrayImpl({
      buffer: edges,
      shape: [bins + 1],
      strides: [1],
      dtype: 'float64',
    }),
  }
}
