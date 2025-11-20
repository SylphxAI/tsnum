import { NDArray } from '../ndarray'
// ===== Numerical Stability Functions =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { inv, norm, svd } from './index'
import { matmul } from './index'

/**
 * Condition number of a matrix
 * Measures sensitivity of matrix inversion
 * cond(A) = ||A|| * ||A^-1||
 *
 * @param a Input matrix
 * @param p Norm type (default: 2 for 2-norm)
 * @returns Condition number
 *
 * @example
 * const A = array([[1, 2], [3, 4]])
 * cond(A) // ~14.9
 */
export function cond<T extends DType>(a: NDArray<T>, p: number | 'fro' = 2): number {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('cond requires 2D matrix')
  }

  const [m, n] = data.shape

  if (m !== n) {
    throw new Error('cond requires square matrix')
  }

  try {
    const aInv = inv(a)
    const normA = norm(a, p)
    const normAInv = norm(aInv, p)
    return normA * normAInv
  } catch {
    // Singular matrix - infinite condition number
    return Number.POSITIVE_INFINITY
  }
}

/**
 * Sign and natural logarithm of the determinant
 * More numerically stable than det() for large matrices
 * Returns (sign, log(|det|))
 *
 * @param a Square matrix
 * @returns {sign, logdet} where det = sign * exp(logdet)
 *
 * @example
 * const A = array([[1, 2], [3, 4]])
 * slogdet(A) // {sign: -1, logdet: 0.693...}  (det = -2)
 */
export function slogdet<T extends DType>(a: NDArray<T>): { sign: number; logdet: number } {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('slogdet requires 2D matrix')
  }

  const [m, n] = data.shape

  if (m !== n) {
    throw new Error('slogdet requires square matrix')
  }

  // Use LU decomposition: det(A) = det(P) * det(L) * det(U)
  // det(L) = 1 (lower triangular with 1s on diagonal)
  // det(U) = product of diagonal elements
  // det(P) = (-1)^(number of row swaps)

  // Convert to Float64Array for numerical stability
  const matrix = new Float64Array(data.buffer)
  let sign = 1
  let logdet = 0

  // Gaussian elimination with partial pivoting
  for (let k = 0; k < n; k++) {
    // Find pivot
    let maxRow = k
    let maxVal = Math.abs(matrix[k * n + k])

    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(matrix[i * n + k])
      if (val > maxVal) {
        maxRow = i
        maxVal = val
      }
    }

    // Check for singular matrix (before swap)
    if (maxVal < 1e-14) {
      return { sign: 0, logdet: Number.NEGATIVE_INFINITY }
    }

    // Swap rows if needed
    if (maxRow !== k) {
      for (let j = 0; j < n; j++) {
        const temp = matrix[k * n + j]
        matrix[k * n + j] = matrix[maxRow * n + j]
        matrix[maxRow * n + j] = temp
      }
      sign *= -1
    }

    // Eliminate below (check pivot again after swap)
    const pivot = matrix[k * n + k]
    if (Math.abs(pivot) < 1e-14) {
      return { sign: 0, logdet: Number.NEGATIVE_INFINITY }
    }

    for (let i = k + 1; i < n; i++) {
      const factor = matrix[i * n + k] / pivot
      for (let j = k; j < n; j++) {
        matrix[i * n + j] -= factor * matrix[k * n + j]
      }
    }
  }

  // Compute log determinant from diagonal
  for (let i = 0; i < n; i++) {
    const diag = matrix[i * n + i]
    if (Math.abs(diag) < 1e-14) {
      return { sign: 0, logdet: Number.NEGATIVE_INFINITY }
    }
    if (diag < 0) {
      sign *= -1
    }
    logdet += Math.log(Math.abs(diag))
  }

  return { sign, logdet }
}

/**
 * Optimized chain matrix multiplication
 * Automatically determines optimal multiplication order
 * For A @ B @ C, computes (A @ B) @ C or A @ (B @ C) based on dimensions
 *
 * @param matrices Array of 2D matrices
 * @returns Product of all matrices
 *
 * @example
 * const A = zeros([10, 100])
 * const B = zeros([100, 5])
 * const C = zeros([5, 50])
 * multi_dot([A, B, C]) // Optimal order: (A @ B) @ C
 */
export function multi_dot<T extends DType>(matrices: NDArray<T>[]): NDArray<T> {
  if (matrices.length === 0) {
    throw new Error('multi_dot requires at least one matrix')
  }

  if (matrices.length === 1) {
    return matrices[0]
  }

  if (matrices.length === 2) {
    return matmul(matrices[0], matrices[1])
  }

  // Extract dimensions
  const dims: number[] = []
  for (let i = 0; i < matrices.length; i++) {
    const data = matrices[i].getData()
    if (data.shape.length !== 2) {
      throw new Error('multi_dot requires 2D matrices')
    }

    if (i === 0) {
      dims.push(data.shape[0])
    }

    dims.push(data.shape[1])

    // Validate dimensions match
    if (i > 0) {
      const prevData = matrices[i - 1].getData()
      if (prevData.shape[1] !== data.shape[0]) {
        throw new Error(`Shape mismatch: matrix ${i - 1} has shape (${prevData.shape[0]}, ${prevData.shape[1]}), matrix ${i} has shape (${data.shape[0]}, ${data.shape[1]})`)
      }
    }
  }

  // Use dynamic programming to find optimal multiplication order
  const n = matrices.length
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const s: number[][] = Array.from({ length: n }, () => Array(n).fill(0))

  // m[i][j] = minimum number of scalar multiplications for matrices i..j
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i < n - len + 1; i++) {
      const j = i + len - 1
      m[i][j] = Number.POSITIVE_INFINITY

      for (let k = i; k < j; k++) {
        const cost = m[i][k] + m[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
        if (cost < m[i][j]) {
          m[i][j] = cost
          s[i][j] = k
        }
      }
    }
  }

  // Recursively multiply using optimal order
  const multiplyRange = (i: number, j: number): NDArray<T> => {
    if (i === j) {
      return matrices[i]
    }

    const k = s[i][j]
    const left = multiplyRange(i, k)
    const right = multiplyRange(k + 1, j)
    return matmul(left, right)
  }

  return multiplyRange(0, n - 1)
}
