// ===== Triangular Matrix Functions =====

import type { DType } from './core/types'
import { createTypedArray } from './core/utils'
import type { NDArray } from './ndarray'
import { NDArray } from './ndarray'

/**
 * Lower triangle of an array
 * Return a copy of an array with elements above the k-th diagonal zeroed
 *
 * @param m Input array
 * @param k Diagonal above which to zero elements (default: 0)
 *           k=0 is the main diagonal, k>0 is above, k<0 is below
 * @returns Lower triangular array
 *
 * @example
 * const A = array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
 * tril(A)
 * // [[1, 0, 0],
 * //  [4, 5, 0],
 * //  [7, 8, 9]]
 *
 * tril(A, 1)
 * // [[1, 2, 0],
 * //  [4, 5, 6],
 * //  [7, 8, 9]]
 */
export function tril<T extends DType>(m: NDArray<T>, k: number = 0): NDArray<T> {
  const data = m.getData()

  if (data.shape.length !== 2) {
    throw new Error('tril requires 2D array')
  }

  const [rows, cols] = data.shape
  const result = createTypedArray(data.buffer.length, data.dtype)

  // Copy input
  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i]
  }

  // Zero out upper triangle
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (j > i + k) {
        result[i * cols + j] = 0
      }
    }
  }

  return new NDArray({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Upper triangle of an array
 * Return a copy of an array with elements below the k-th diagonal zeroed
 *
 * @param m Input array
 * @param k Diagonal below which to zero elements (default: 0)
 *           k=0 is the main diagonal, k>0 is above, k<0 is below
 * @returns Upper triangular array
 *
 * @example
 * const A = array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
 * triu(A)
 * // [[1, 2, 3],
 * //  [0, 5, 6],
 * //  [0, 0, 9]]
 *
 * triu(A, 1)
 * // [[0, 2, 3],
 * //  [0, 0, 6],
 * //  [0, 0, 0]]
 */
export function triu<T extends DType>(m: NDArray<T>, k: number = 0): NDArray<T> {
  const data = m.getData()

  if (data.shape.length !== 2) {
    throw new Error('triu requires 2D array')
  }

  const [rows, cols] = data.shape
  const result = createTypedArray(data.buffer.length, data.dtype)

  // Copy input
  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i]
  }

  // Zero out lower triangle
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (j < i + k) {
        result[i * cols + j] = 0
      }
    }
  }

  return new NDArray({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}
