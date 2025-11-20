// ===== Linear Algebra =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Dot product of two arrays
 * For 1D: inner product
 * For 2D: matrix multiplication
 */
export function dot<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> | number {
  const aData = a.getData()
  const bData = b.getData()

  // 1D dot product (inner product)
  if (aData.shape.length === 1 && bData.shape.length === 1) {
    if (aData.buffer.length !== bData.buffer.length) {
      throw new Error('Arrays must have same length for dot product')
    }

    let result = 0
    for (let i = 0; i < aData.buffer.length; i++) {
      result += aData.buffer[i] * bData.buffer[i]
    }
    return result
  }

  // 2D matrix multiplication
  if (aData.shape.length === 2 && bData.shape.length === 2) {
    return matmul(a, b)
  }

  // 1D x 2D: vector-matrix multiplication
  if (aData.shape.length === 1 && bData.shape.length === 2) {
    const m = aData.shape[0]
    const n = bData.shape[1]

    if (m !== bData.shape[0]) {
      throw new Error(`Shape mismatch: (${m},) and (${bData.shape[0]}, ${n})`)
    }

    const newBuffer = createTypedArray(n, aData.dtype)

    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < m; k++) {
        sum += aData.buffer[k] * bData.buffer[k * n + j]
      }
      newBuffer[j] = sum
    }

    return new NDArrayImpl({
      buffer: newBuffer,
      shape: [n],
      strides: [1],
      dtype: aData.dtype,
    })
  }

  throw new Error('Unsupported array dimensions for dot')
}

/**
 * Matrix multiplication
 */
export function matmul<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.shape.length !== 2 || bData.shape.length !== 2) {
    throw new Error('matmul requires 2D arrays')
  }

  const m = aData.shape[0]
  const k = aData.shape[1]
  const n = bData.shape[1]

  if (k !== bData.shape[0]) {
    throw new Error(`Shape mismatch: (${m}, ${k}) and (${bData.shape[0]}, ${n})`)
  }

  const newBuffer = createTypedArray(m * n, aData.dtype)

  // Matrix multiplication: C[i,j] = sum(A[i,k] * B[k,j])
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let kIdx = 0; kIdx < k; kIdx++) {
        sum += aData.buffer[i * k + kIdx] * bData.buffer[kIdx * n + j]
      }
      newBuffer[i * n + j] = sum
    }
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: [m, n],
    strides: [n, 1],
    dtype: aData.dtype,
  })
}

/**
 * Outer product of two vectors
 */
export function outer<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.shape.length !== 1 || bData.shape.length !== 1) {
    throw new Error('outer requires 1D arrays')
  }

  const m = aData.buffer.length
  const n = bData.buffer.length
  const newBuffer = createTypedArray(m * n, aData.dtype)

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      newBuffer[i * n + j] = aData.buffer[i] * bData.buffer[j]
    }
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: [m, n],
    strides: [n, 1],
    dtype: aData.dtype,
  })
}

/**
 * Inner product of two vectors (same as dot for 1D)
 */
export function inner<T extends DType>(a: NDArray<T>, b: NDArray<T>): number {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.shape.length !== 1 || bData.shape.length !== 1) {
    throw new Error('inner requires 1D arrays')
  }

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for inner product')
  }

  let result = 0
  for (let i = 0; i < aData.buffer.length; i++) {
    result += aData.buffer[i] * bData.buffer[i]
  }
  return result
}

/**
 * Compute the norm of a vector or matrix
 */
export function norm<T extends DType>(a: NDArray<T>, ord: number | 'fro' = 2): number {
  const data = a.getData()

  if (ord === 2) {
    // L2 norm (Euclidean)
    let sum = 0
    for (let i = 0; i < data.buffer.length; i++) {
      sum += data.buffer[i] * data.buffer[i]
    }
    return Math.sqrt(sum)
  }

  if (ord === 1) {
    // L1 norm (Manhattan)
    let sum = 0
    for (let i = 0; i < data.buffer.length; i++) {
      sum += Math.abs(data.buffer[i])
    }
    return sum
  }

  if (ord === Number.POSITIVE_INFINITY) {
    // Max norm
    let max = 0
    for (let i = 0; i < data.buffer.length; i++) {
      const abs = Math.abs(data.buffer[i])
      if (abs > max) max = abs
    }
    return max
  }

  if (ord === 'fro') {
    // Frobenius norm (same as L2 for vectors)
    let sum = 0
    for (let i = 0; i < data.buffer.length; i++) {
      sum += data.buffer[i] * data.buffer[i]
    }
    return Math.sqrt(sum)
  }

  throw new Error(`Unsupported norm order: ${ord}`)
}

/**
 * Compute the determinant of a square matrix (2x2 or 3x3 only)
 */
export function det<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[0] !== data.shape[1]) {
    throw new Error('det requires square 2D array')
  }

  const n = data.shape[0]

  if (n === 2) {
    // 2x2 determinant: ad - bc
    return data.buffer[0] * data.buffer[3] - data.buffer[1] * data.buffer[2]
  }

  if (n === 3) {
    // 3x3 determinant using rule of Sarrus
    const [a11, a12, a13, a21, a22, a23, a31, a32, a33] = data.buffer
    return (
      a11 * a22 * a33 +
      a12 * a23 * a31 +
      a13 * a21 * a32 -
      a13 * a22 * a31 -
      a12 * a21 * a33 -
      a11 * a23 * a32
    )
  }

  throw new Error('det only supports 2x2 and 3x3 matrices')
}

/**
 * Compute matrix trace (sum of diagonal elements)
 */
export function trace<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('trace requires 2D array')
  }

  const n = Math.min(data.shape[0], data.shape[1])
  const stride = data.shape[1] + 1

  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += data.buffer[i * stride]
  }
  return sum
}
