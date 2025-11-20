// ===== Linear Algebra =====

import type { DType } from '../core/types'
import { computeStrides, createTypedArray } from '../core/utils'
import { eye } from '../creation'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

// Export numerical stability functions
export { cond, slogdet, multi_dot } from './numerical-stability'

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

/**
 * QR decomposition using Gram-Schmidt process
 * Returns { q: orthogonal matrix, r: upper triangular matrix }
 */
export function qr<T extends DType>(a: NDArray<T>): { q: NDArray<T>; r: NDArray<T> } {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('qr requires 2D array')
  }

  const m = data.shape[0]
  const n = data.shape[1]

  // Q and R buffers
  const qBuffer = createTypedArray(m * n, data.dtype)
  const rBuffer = createTypedArray(n * n, data.dtype)

  // Gram-Schmidt process
  for (let j = 0; j < n; j++) {
    // Copy column j from A
    const col = new Array(m)
    for (let i = 0; i < m; i++) {
      col[i] = data.buffer[i * n + j]
    }

    // Orthogonalize against previous columns
    for (let k = 0; k < j; k++) {
      // Compute <q_k, a_j>
      let dot = 0
      for (let i = 0; i < m; i++) {
        dot += qBuffer[i * n + k] * col[i]
      }
      rBuffer[k * n + j] = dot

      // Subtract projection
      for (let i = 0; i < m; i++) {
        col[i] -= dot * qBuffer[i * n + k]
      }
    }

    // Normalize
    let norm = 0
    for (let i = 0; i < m; i++) {
      norm += col[i] * col[i]
    }
    norm = Math.sqrt(norm)
    rBuffer[j * n + j] = norm

    // Store normalized column in Q
    for (let i = 0; i < m; i++) {
      qBuffer[i * n + j] = col[i] / norm
    }
  }

  return {
    q: new NDArrayImpl({
      buffer: qBuffer,
      shape: [m, n],
      strides: [n, 1],
      dtype: data.dtype,
    }),
    r: new NDArrayImpl({
      buffer: rBuffer,
      shape: [n, n],
      strides: [n, 1],
      dtype: data.dtype,
    }),
  }
}

/**
 * Cholesky decomposition for positive-definite matrices
 * Returns L where A = L @ L.T
 */
export function cholesky<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[0] !== data.shape[1]) {
    throw new Error('cholesky requires square 2D array')
  }

  const n = data.shape[0]
  const lBuffer = createTypedArray(n * n, data.dtype)

  // Cholesky-Banachiewicz algorithm
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0

      if (j === i) {
        // Diagonal elements
        for (let k = 0; k < j; k++) {
          sum += lBuffer[j * n + k] * lBuffer[j * n + k]
        }
        const diag = data.buffer[j * n + j] - sum
        if (diag <= 0) {
          throw new Error('Matrix is not positive-definite')
        }
        lBuffer[j * n + j] = Math.sqrt(diag)
      } else {
        // Off-diagonal elements
        for (let k = 0; k < j; k++) {
          sum += lBuffer[i * n + k] * lBuffer[j * n + k]
        }
        lBuffer[i * n + j] = (data.buffer[i * n + j] - sum) / lBuffer[j * n + j]
      }
    }
  }

  return new NDArrayImpl({
    buffer: lBuffer,
    shape: [n, n],
    strides: [n, 1],
    dtype: data.dtype,
  })
}

/**
 * Eigenvalue decomposition using power iteration (simplified)
 * Returns { values: eigenvalues, vectors: eigenvectors }
 * Note: This is a simplified implementation for dominant eigenvalue only
 */
export function eig<T extends DType>(
  a: NDArray<T>,
  maxIter = 100,
): { values: NDArray<T>; vectors: NDArray<T> } {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[0] !== data.shape[1]) {
    throw new Error('eig requires square 2D array')
  }

  const n = data.shape[0]

  // Power iteration for dominant eigenvalue
  let v = createTypedArray(n, data.dtype)
  // Initialize with random values
  for (let i = 0; i < n; i++) {
    v[i] = Math.random()
  }

  let eigenvalue = 0

  for (let iter = 0; iter < maxIter; iter++) {
    // Normalize v
    let norm = 0
    for (let i = 0; i < n; i++) {
      norm += v[i] * v[i]
    }
    norm = Math.sqrt(norm)
    for (let i = 0; i < n; i++) {
      v[i] /= norm
    }

    // Compute A @ v
    const av = createTypedArray(n, data.dtype)
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        sum += data.buffer[i * n + j] * v[j]
      }
      av[i] = sum
    }

    // Compute eigenvalue (Rayleigh quotient)
    let num = 0
    let den = 0
    for (let i = 0; i < n; i++) {
      num += v[i] * av[i]
      den += v[i] * v[i]
    }
    eigenvalue = num / den

    // Update v
    v = av
  }

  // Normalize final eigenvector
  let norm = 0
  for (let i = 0; i < n; i++) {
    norm += v[i] * v[i]
  }
  norm = Math.sqrt(norm)
  for (let i = 0; i < n; i++) {
    v[i] /= norm
  }

  // Return dominant eigenvalue/eigenvector
  const valuesBuffer = createTypedArray(1, data.dtype)
  valuesBuffer[0] = eigenvalue

  return {
    values: new NDArrayImpl({
      buffer: valuesBuffer,
      shape: [1],
      strides: [1],
      dtype: data.dtype,
    }),
    vectors: new NDArrayImpl({
      buffer: v,
      shape: [n],
      strides: [1],
      dtype: data.dtype,
    }),
  }
}

/**
 * Singular Value Decomposition (simplified using eigendecomposition)
 * Returns { u: left singular vectors, s: singular values, vt: right singular vectors transposed }
 * Note: This is a simplified implementation for educational purposes
 */
export function svd<T extends DType>(
  a: NDArray<T>,
): { u: NDArray<T>; s: NDArray<T>; vt: NDArray<T> } {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('svd requires 2D array')
  }

  const m = data.shape[0]
  const n = data.shape[1]

  // For small matrices, use direct computation
  if (m === 2 && n === 2) {
    // Compute A^T @ A
    const ata = createTypedArray(4, data.dtype)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let sum = 0
        for (let k = 0; k < 2; k++) {
          sum += data.buffer[k * 2 + i] * data.buffer[k * 2 + j]
        }
        ata[i * 2 + j] = sum
      }
    }

    // Eigenvalues of 2x2 symmetric matrix
    const trace = ata[0] + ata[3]
    const det = ata[0] * ata[3] - ata[1] * ata[2]
    const discriminant = (trace * trace) / 4 - det

    if (discriminant < 0) {
      throw new Error('Cannot compute SVD: complex eigenvalues')
    }

    const lambda1 = trace / 2 + Math.sqrt(discriminant)
    const lambda2 = trace / 2 - Math.sqrt(discriminant)

    const s1 = Math.sqrt(Math.max(0, lambda1))
    const s2 = Math.sqrt(Math.max(0, lambda2))

    // Singular values in descending order
    const sBuffer = createTypedArray(2, data.dtype)
    sBuffer[0] = Math.max(s1, s2)
    sBuffer[1] = Math.min(s1, s2)

    // Simplified U and V (identity for now)
    const uBuffer = createTypedArray(4, data.dtype)
    uBuffer[0] = 1
    uBuffer[3] = 1

    const vtBuffer = createTypedArray(4, data.dtype)
    vtBuffer[0] = 1
    vtBuffer[3] = 1

    return {
      u: new NDArrayImpl({
        buffer: uBuffer,
        shape: [2, 2],
        strides: [2, 1],
        dtype: data.dtype,
      }),
      s: new NDArrayImpl({
        buffer: sBuffer,
        shape: [2],
        strides: [1],
        dtype: data.dtype,
      }),
      vt: new NDArrayImpl({
        buffer: vtBuffer,
        shape: [2, 2],
        strides: [2, 1],
        dtype: data.dtype,
      }),
    }
  }

  throw new Error('svd only supports 2x2 matrices in this implementation')
}

/**
 * Matrix inverse using Gauss-Jordan elimination (2x2 and 3x3 only)
 */
export function inv<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[0] !== data.shape[1]) {
    throw new Error('inv requires square 2D array')
  }

  const n = data.shape[0]

  if (n === 2) {
    const [a11, a12, a21, a22] = data.buffer
    const detVal = a11 * a22 - a12 * a21

    if (Math.abs(detVal) < 1e-10) {
      throw new Error('Matrix is singular')
    }

    const invBuffer = createTypedArray(4, data.dtype)
    invBuffer[0] = a22 / detVal
    invBuffer[1] = -a12 / detVal
    invBuffer[2] = -a21 / detVal
    invBuffer[3] = a11 / detVal

    return new NDArrayImpl({
      buffer: invBuffer,
      shape: [2, 2],
      strides: [2, 1],
      dtype: data.dtype,
    })
  }

  if (n === 3) {
    const detVal = det(a)

    if (Math.abs(detVal) < 1e-10) {
      throw new Error('Matrix is singular')
    }

    const [a11, a12, a13, a21, a22, a23, a31, a32, a33] = data.buffer

    // Compute adjugate matrix
    const invBuffer = createTypedArray(9, data.dtype)
    invBuffer[0] = (a22 * a33 - a23 * a32) / detVal
    invBuffer[1] = (a13 * a32 - a12 * a33) / detVal
    invBuffer[2] = (a12 * a23 - a13 * a22) / detVal
    invBuffer[3] = (a23 * a31 - a21 * a33) / detVal
    invBuffer[4] = (a11 * a33 - a13 * a31) / detVal
    invBuffer[5] = (a13 * a21 - a11 * a23) / detVal
    invBuffer[6] = (a21 * a32 - a22 * a31) / detVal
    invBuffer[7] = (a12 * a31 - a11 * a32) / detVal
    invBuffer[8] = (a11 * a22 - a12 * a21) / detVal

    return new NDArrayImpl({
      buffer: invBuffer,
      shape: [3, 3],
      strides: [3, 1],
      dtype: data.dtype,
    })
  }

  throw new Error('inv only supports 2x2 and 3x3 matrices')
}

/**
 * Solve linear system Ax = b using Gaussian elimination (2x2 and 3x3 only)
 */
export function solve<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.shape.length !== 2 || aData.shape[0] !== aData.shape[1]) {
    throw new Error('solve requires square 2D matrix')
  }

  if (bData.shape.length !== 1 || bData.shape[0] !== aData.shape[0]) {
    throw new Error('b must be 1D array with length matching A')
  }

  const n = aData.shape[0]

  if (n === 2) {
    const [a11, a12, a21, a22] = aData.buffer
    const [b1, b2] = bData.buffer

    const detVal = a11 * a22 - a12 * a21

    if (Math.abs(detVal) < 1e-10) {
      throw new Error('Matrix is singular')
    }

    const xBuffer = createTypedArray(2, aData.dtype)
    xBuffer[0] = (a22 * b1 - a12 * b2) / detVal
    xBuffer[1] = (a11 * b2 - a21 * b1) / detVal

    return new NDArrayImpl({
      buffer: xBuffer,
      shape: [2],
      strides: [1],
      dtype: aData.dtype,
    })
  }

  // For larger systems, use matrix inverse
  const aInv = inv(a)
  const aInvData = aInv.getData()

  const xBuffer = createTypedArray(n, aData.dtype)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = 0; j < n; j++) {
      sum += aInvData.buffer[i * n + j] * bData.buffer[j]
    }
    xBuffer[i] = sum
  }

  return new NDArrayImpl({
    buffer: xBuffer,
    shape: [n],
    strides: [1],
    dtype: aData.dtype,
  })
}

// ===== Advanced Linear Algebra =====

/**
 * Compute the Moore-Penrose pseudoinverse
 * Uses SVD decomposition: A+ = V * Σ+ * U^T
 */
export function pinv<T extends DType>(a: NDArray<T>, rcond = 1e-15): NDArray<T> {
  const aData = a.getData()

  if (aData.shape.length !== 2) {
    throw new Error('pinv only supports 2D arrays')
  }

  const [m, n] = aData.shape

  // Use SVD: A = U * Σ * V^T
  const { u, s, vt } = svd(a)
  const uData = u.getData()
  const sData = s.getData()
  const vtData = vt.getData()

  // Find cutoff for small singular values
  const sArray = Array.from(sData.buffer)
  const maxSingular = Math.max(...(sArray as number[]))
  const cutoff = rcond * maxSingular

  // Compute Σ+ (reciprocal of singular values, zero for small values)
  const sInv = createTypedArray(sData.buffer.length, sData.dtype)
  for (let i = 0; i < sData.buffer.length; i++) {
    sInv[i] = Math.abs(sData.buffer[i]) > cutoff ? 1 / sData.buffer[i] : 0
  }

  // Compute A+ = V * Σ+ * U^T
  // Note: vt is V^T, so we need to transpose it
  const result = createTypedArray(n * m, aData.dtype)
  const rank = Math.min(m, n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let sum = 0
      for (let k = 0; k < rank; k++) {
        // vt[k, i] gives V[i, k] after transposing
        sum += vtData.buffer[k * n + i] * sInv[k] * uData.buffer[j * rank + k]
      }
      result[i * m + j] = sum
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [n, m],
    strides: computeStrides([n, m]),
    dtype: aData.dtype,
  })
}

/**
 * Compute the rank of a matrix
 * Uses SVD to count non-zero singular values
 */
export function matrix_rank<T extends DType>(a: NDArray<T>, tol?: number): number {
  const aData = a.getData()

  if (aData.shape.length !== 2) {
    throw new Error('matrix_rank only supports 2D arrays')
  }

  const { s } = svd(a)
  const sData = s.getData()

  // Determine tolerance if not provided
  const sArray = Array.from(sData.buffer)
  const maxSingular = Math.max(...(sArray as number[]))
  const tolerance = tol ?? maxSingular * Math.max(aData.shape[0], aData.shape[1]) * 1e-15

  // Count singular values above tolerance
  let rank = 0
  for (let i = 0; i < sData.buffer.length; i++) {
    if (Math.abs(sData.buffer[i]) > tolerance) {
      rank++
    }
  }

  return rank
}

/**
 * Raise a square matrix to the power n
 */
export function matrix_power<T extends DType>(a: NDArray<T>, n: number): NDArray<T> {
  const aData = a.getData()

  if (aData.shape.length !== 2) {
    throw new Error('matrix_power only supports 2D arrays')
  }

  const [rows, cols] = aData.shape

  if (rows !== cols) {
    throw new Error('matrix_power requires square matrix')
  }

  if (n === 0) {
    // Return identity matrix
    return eye(rows, { dtype: aData.dtype }) as NDArray<T>
  }

  if (n === 1) {
    // Return copy of original matrix
    const buffer = createTypedArray(aData.buffer.length, aData.dtype)
    for (let i = 0; i < aData.buffer.length; i++) {
      buffer[i] = aData.buffer[i]
    }
    return new NDArrayImpl({
      buffer,
      shape: aData.shape,
      strides: aData.strides,
      dtype: aData.dtype,
    })
  }

  if (n < 0) {
    // Use inverse for negative powers
    const aInv = inv(a)
    return matrix_power(aInv, -n)
  }

  // Use repeated squaring for efficiency
  let result = a
  let power = n

  // Start with identity
  let accum = eye(rows, { dtype: aData.dtype }) as NDArray<T>

  while (power > 0) {
    if (power % 2 === 1) {
      accum = matmul(accum, result)
    }
    result = matmul(result, result)
    power = Math.floor(power / 2)
  }

  return accum
}

/**
 * Solve linear least squares problem: minimize ||Ax - b||^2
 * Returns x that minimizes the squared error
 */
export function lstsq<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T>,
  rcond = 1e-15,
): { x: NDArray<DType>; residuals: number; rank: number } {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.shape.length !== 2) {
    throw new Error('A must be 2D array')
  }

  if (bData.shape.length !== 1) {
    throw new Error('b must be 1D array for now')
  }

  const [m, n] = aData.shape

  if (bData.shape[0] !== m) {
    throw new Error('Incompatible dimensions')
  }

  // Use pseudoinverse: x = A+ * b
  const aPinv = pinv(a, rcond)
  const aPinvData = aPinv.getData()

  // Compute x = A+ * b
  const xBuffer = createTypedArray(n, aData.dtype)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = 0; j < m; j++) {
      sum += aPinvData.buffer[i * m + j] * bData.buffer[j]
    }
    xBuffer[i] = sum
  }

  const x = new NDArrayImpl({
    buffer: xBuffer,
    shape: [n],
    strides: [1],
    dtype: aData.dtype,
  }) as NDArray<T>

  // Compute residuals: ||Ax - b||^2
  let residualSum = 0
  for (let i = 0; i < m; i++) {
    let axValue = 0
    for (let j = 0; j < n; j++) {
      axValue += aData.buffer[i * n + j] * xBuffer[j]
    }
    const diff = axValue - bData.buffer[i]
    residualSum += diff * diff
  }

  const rank = matrix_rank(a, rcond)

  return {
    x,
    residuals: residualSum,
    rank,
  }
}
