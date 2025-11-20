// ===== Validation and Comparison =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Test element-wise for NaN
 */
export function isnan<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()
  const buffer = new Int32Array(data.buffer.length)

  for (let i = 0; i < data.buffer.length; i++) {
    buffer[i] = Number.isNaN(data.buffer[i]) ? 1 : 0
  }

  return new NDArrayImpl({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: 'int32',
  })
}

/**
 * Test element-wise for positive or negative infinity
 */
export function isinf<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()
  const buffer = new Int32Array(data.buffer.length)

  for (let i = 0; i < data.buffer.length; i++) {
    buffer[i] = !Number.isFinite(data.buffer[i]) && !Number.isNaN(data.buffer[i]) ? 1 : 0
  }

  return new NDArrayImpl({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: 'int32',
  })
}

/**
 * Test element-wise for finiteness (not infinity and not NaN)
 */
export function isfinite<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()
  const buffer = new Int32Array(data.buffer.length)

  for (let i = 0; i < data.buffer.length; i++) {
    buffer[i] = Number.isFinite(data.buffer[i]) ? 1 : 0
  }

  return new NDArrayImpl({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: 'int32',
  })
}

/**
 * Returns a boolean array where two arrays are element-wise equal within a tolerance
 */
export function isclose<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T>,
  rtol = 1e-5,
  atol = 1e-8,
): NDArray<'int32'> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for isclose')
  }

  const buffer = new Int32Array(aData.buffer.length)

  for (let i = 0; i < aData.buffer.length; i++) {
    const aVal = Number(aData.buffer[i])
    const bVal = Number(bData.buffer[i])

    // Check if close: |a - b| <= (atol + rtol * |b|)
    const diff = Math.abs(aVal - bVal)
    const tolerance = atol + rtol * Math.abs(bVal)

    buffer[i] = diff <= tolerance ? 1 : 0
  }

  return new NDArrayImpl({
    buffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: 'int32',
  })
}

/**
 * Returns True if two arrays are element-wise equal within a tolerance
 */
export function allclose<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T>,
  rtol = 1e-5,
  atol = 1e-8,
): boolean {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    return false
  }

  for (let i = 0; i < aData.buffer.length; i++) {
    const aVal = Number(aData.buffer[i])
    const bVal = Number(bData.buffer[i])

    // Check if close: |a - b| <= (atol + rtol * |b|)
    const diff = Math.abs(aVal - bVal)
    const tolerance = atol + rtol * Math.abs(bVal)

    if (diff > tolerance) {
      return false
    }
  }

  return true
}

/**
 * Return the indices of the elements that are non-zero
 */
export function nonzero<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()
  const indices: number[] = []

  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] !== 0) {
      indices.push(i)
    }
  }

  const buffer = new Int32Array(indices)

  return new NDArrayImpl({
    buffer,
    shape: [indices.length],
    strides: [1],
    dtype: 'int32',
  })
}

/**
 * Find indices where elements should be inserted to maintain order
 */
export function searchsorted<T extends DType>(
  a: NDArray<T>,
  v: number | number[],
): number | number[] {
  const data = a.getData()
  const values = typeof v === 'number' ? [v] : v
  const results: number[] = []

  for (const val of values) {
    // Binary search
    let left = 0
    let right = data.buffer.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (data.buffer[mid] < val) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    results.push(left)
  }

  return typeof v === 'number' ? results[0] : results
}
