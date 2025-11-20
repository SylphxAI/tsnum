// ===== Advanced Statistics =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'
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
    return new NDArray({
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

  return new NDArray({
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

    return new NDArray({
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

  return new NDArray({
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
    counts: new NDArray({
      buffer: counts,
      shape: [bins],
      strides: [1],
      dtype: 'int32',
    }),
    edges: new NDArray({
      buffer: edges,
      shape: [bins + 1],
      strides: [1],
      dtype: 'float64',
    }),
  }
}

// ===== NaN-Aware Statistics =====

/**
 * Compute mean ignoring NaN values
 */
export function nanmean<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  let sum = 0
  let count = 0

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      sum += val
      count++
    }
  }

  return count > 0 ? sum / count : Number.NaN
}

/**
 * Compute sum ignoring NaN values
 */
export function nansum<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  let sum = 0

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      sum += val
    }
  }

  return sum
}

/**
 * Compute minimum ignoring NaN values
 */
export function nanmin<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  let min = Number.POSITIVE_INFINITY

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val) && val < min) {
      min = val
    }
  }

  return min === Number.POSITIVE_INFINITY ? Number.NaN : min
}

/**
 * Compute maximum ignoring NaN values
 */
export function nanmax<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  let max = Number.NEGATIVE_INFINITY

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val) && val > max) {
      max = val
    }
  }

  return max === Number.NEGATIVE_INFINITY ? Number.NaN : max
}

/**
 * Compute standard deviation ignoring NaN values
 */
export function nanstd<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  const avg = nanmean(a)

  if (Number.isNaN(avg)) {
    return Number.NaN
  }

  let sumSq = 0
  let count = 0

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      const diff = val - avg
      sumSq += diff * diff
      count++
    }
  }

  return count > 0 ? Math.sqrt(sumSq / count) : Number.NaN
}

/**
 * Compute median ignoring NaN values
 */
export function nanmedian<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()

  // Filter out NaN values and sort
  const validValues: number[] = []
  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      validValues.push(val)
    }
  }

  if (validValues.length === 0) {
    return Number.NaN
  }

  validValues.sort((a, b) => a - b)

  const mid = Math.floor(validValues.length / 2)

  if (validValues.length % 2 === 0) {
    return (validValues[mid - 1] + validValues[mid]) / 2
  }

  return validValues[mid]
}

/**
 * Compute variance ignoring NaN values
 */
export function nanvar<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  const avg = nanmean(a)

  if (Number.isNaN(avg)) {
    return Number.NaN
  }

  let sumSq = 0
  let count = 0

  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (!Number.isNaN(val)) {
      const diff = val - avg
      sumSq += diff * diff
      count++
    }
  }

  return count > 0 ? sumSq / count : Number.NaN
}

// ===== Additional Statistics =====

/**
 * Count occurrences of each value in array of non-negative integers
 */
export function bincount<T extends DType>(a: NDArray<T>, minlength = 0): NDArray<'int32'> {
  const data = a.getData()

  // Find max value
  let maxVal = minlength - 1
  for (let i = 0; i < data.buffer.length; i++) {
    const val = Math.floor(data.buffer[i])
    if (val < 0) {
      throw new Error('bincount requires non-negative integers')
    }
    if (val > maxVal) {
      maxVal = val
    }
  }

  const length = maxVal + 1
  const counts = new Int32Array(length)

  // Count occurrences
  for (let i = 0; i < data.buffer.length; i++) {
    const val = Math.floor(data.buffer[i])
    counts[val]++
  }

  return new NDArray({
    buffer: counts,
    shape: [length],
    strides: [1],
    dtype: 'int32',
  })
}

/**
 * Return indices of bins to which each value belongs
 */
export function digitize<T extends DType>(
  a: NDArray<T>,
  bins: NDArray<T>,
  right = false,
): NDArray<'int32'> {
  const aData = a.getData()
  const binsData = bins.getData()

  if (binsData.shape.length !== 1) {
    throw new Error('bins must be 1D array')
  }

  const indices = new Int32Array(aData.buffer.length)

  for (let i = 0; i < aData.buffer.length; i++) {
    const value = aData.buffer[i]
    let binIdx = 0

    if (right) {
      // Find first bin where value < bin
      for (let j = 0; j < binsData.buffer.length; j++) {
        if (value < binsData.buffer[j]) {
          break
        }
        binIdx = j + 1
      }
    } else {
      // Find first bin where value <= bin
      for (let j = 0; j < binsData.buffer.length; j++) {
        if (value <= binsData.buffer[j]) {
          break
        }
        binIdx = j + 1
      }
    }

    indices[i] = binIdx
  }

  return new NDArray({
    buffer: indices,
    shape: aData.shape,
    strides: aData.strides,
    dtype: 'int32',
  })
}

/**
 * Return indices where condition is non-zero
 */
export function argwhere<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()

  // First pass: count non-zero elements
  let count = 0
  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] !== 0) {
      count++
    }
  }

  if (data.shape.length === 1) {
    // 1D: return [count, 1] array of indices
    const indices = new Int32Array(count)
    let idx = 0

    for (let i = 0; i < data.buffer.length; i++) {
      if (data.buffer[i] !== 0) {
        indices[idx++] = i
      }
    }

    return new NDArray({
      buffer: indices,
      shape: [count],
      strides: [1],
      dtype: 'int32',
    })
  }

  if (data.shape.length === 2) {
    // 2D: return [count, 2] array of [row, col] indices
    const [rows, cols] = data.shape
    const indices = new Int32Array(count * 2)
    let idx = 0

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (data.buffer[i * cols + j] !== 0) {
          indices[idx * 2] = i
          indices[idx * 2 + 1] = j
          idx++
        }
      }
    }

    return new NDArray({
      buffer: indices,
      shape: [count, 2],
      strides: [2, 1],
      dtype: 'int32',
    })
  }

  throw new Error('argwhere only supports 1D and 2D arrays')
}

// ===== Enhanced Statistics Functions =====

/**
 * Compute weighted average
 * average(a, weights=w) = sum(a * w) / sum(w)
 *
 * @param a Input array
 * @param weights Weights array (same shape as a)
 * @param axis Axis along which to average (default: flatten)
 * @returns Weighted average
 *
 * @example
 * average(array([1, 2, 3, 4]), array([1, 1, 1, 1])) // 2.5
 * average(array([1, 2, 3, 4]), array([1, 2, 3, 4])) // 3.0
 */
export function average<T extends DType>(
  a: NDArray<T>,
  weights?: NDArray<T>,
  axis?: number
): number {
  const data = a.getData()

  if (!weights) {
    // Unweighted average (same as mean)
    if (axis !== undefined) {
      throw new Error('axis parameter not yet supported for average without weights')
    }
    let sum = 0
    for (let i = 0; i < data.buffer.length; i++) {
      sum += data.buffer[i]
    }
    return sum / data.buffer.length
  }

  const wData = weights.getData()

  if (data.buffer.length !== wData.buffer.length) {
    throw new Error('weights must have same size as array')
  }

  if (axis !== undefined) {
    throw new Error('axis parameter not yet supported for weighted average')
  }

  let weightedSum = 0
  let weightSum = 0

  for (let i = 0; i < data.buffer.length; i++) {
    weightedSum += data.buffer[i] * wData.buffer[i]
    weightSum += wData.buffer[i]
  }

  if (weightSum === 0) {
    throw new Error('sum of weights is zero')
  }

  return weightedSum / weightSum
}

/**
 * Peak to peak (maximum - minimum) value
 *
 * @param a Input array
 * @param axis Axis along which to compute (default: flatten)
 * @returns Peak to peak range
 *
 * @example
 * ptp(array([1, 2, 3, 4, 5])) // 4 (5 - 1)
 */
export function ptp<T extends DType>(a: NDArray<T>, axis?: number): number {
  const data = a.getData()

  if (axis !== undefined) {
    throw new Error('axis parameter not yet supported for ptp')
  }

  if (data.buffer.length === 0) {
    return 0
  }

  let min = data.buffer[0]
  let max = data.buffer[0]

  for (let i = 1; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    if (val < min) min = val
    if (val > max) max = val
  }

  return max - min
}

/**
 * Compute percentile while ignoring NaN values
 *
 * @param a Input array
 * @param q Percentile (0-100)
 * @returns Percentile value
 *
 * @example
 * nanpercentile(array([1, 2, NaN, 3, 4]), 50) // 2.5
 */
export function nanpercentile<T extends DType>(a: NDArray<T>, q: number): number {
  if (q < 0 || q > 100) {
    throw new Error('Percentile must be between 0 and 100')
  }

  const data = a.getData()

  // Filter out NaN values
  const valid = []
  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    if (!Number.isNaN(val)) {
      valid.push(val)
    }
  }

  if (valid.length === 0) {
    return Number.NaN
  }

  if (valid.length === 1) {
    return valid[0]
  }

  // Sort
  valid.sort((a, b) => a - b)

  // Linear interpolation
  const index = (q / 100) * (valid.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  return valid[lower] * (1 - weight) + valid[upper] * weight
}

/**
 * Compute quantile while ignoring NaN values
 * quantile(a, q) where q is in [0, 1]
 *
 * @param a Input array
 * @param q Quantile (0-1)
 * @returns Quantile value
 *
 * @example
 * nanquantile(array([1, 2, NaN, 3, 4]), 0.5) // 2.5
 */
export function nanquantile<T extends DType>(a: NDArray<T>, q: number): number {
  if (q < 0 || q > 1) {
    throw new Error('Quantile must be between 0 and 1')
  }

  return nanpercentile(a, q * 100)
}
