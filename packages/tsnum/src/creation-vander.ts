// ===== Vandermonde Matrix =====

import type { DType } from './core/types'
import { createTypedArray } from './core/utils'
import type { NDArray } from './ndarray'
import { NDArray as NDArrayImpl } from './ndarray'

/**
 * Generate a Vandermonde matrix
 * The columns of the output matrix are powers of the input vector
 *
 * @param x 1-D input array
 * @param N Number of columns in the output (default: len(x))
 *          If N is not specified, a square array is returned (N = len(x))
 * @param increasing If true, powers increase from left to right [1, x, x^2, ...]
 *                   If false (default), powers decrease [x^(N-1), ..., x^2, x, 1]
 * @returns Vandermonde matrix with shape (len(x), N)
 *
 * @example
 * vander(array([1, 2, 3, 4]), 3)
 * // [[1, 1, 1],
 * //  [4, 2, 1],
 * //  [9, 3, 1],
 * //  [16, 4, 1]]
 *
 * vander(array([1, 2, 3]), undefined, true)
 * // [[1, 1, 1],
 * //  [1, 2, 4],
 * //  [1, 3, 9]]
 */
export function vander<T extends DType>(
  x: NDArray<T>,
  N?: number,
  increasing: boolean = false
): NDArray<'float64'> {
  const data = x.getData()

  if (data.shape.length !== 1) {
    throw new Error('vander requires 1-D input array')
  }

  const n = data.buffer.length
  const cols = N ?? n

  if (cols < 0) {
    throw new Error('N must be non-negative')
  }

  // Create result buffer
  const result = createTypedArray(n * cols, 'float64')

  // Fill Vandermonde matrix
  for (let i = 0; i < n; i++) {
    const val = data.buffer[i]

    if (increasing) {
      // Powers increase: [1, x, x^2, ..., x^(N-1)]
      for (let j = 0; j < cols; j++) {
        result[i * cols + j] = val ** j
      }
    } else {
      // Powers decrease (default): [x^(N-1), ..., x^2, x, 1]
      for (let j = 0; j < cols; j++) {
        result[i * cols + j] = val ** (cols - 1 - j)
      }
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [n, cols],
    strides: [cols, 1],
    dtype: 'float64',
  })
}
