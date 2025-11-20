// ===== Polynomial Functions =====

import type { DType } from './core/types'
import { createTypedArray } from './core/utils'
import type { NDArray } from './ndarray'
import { NDArray as NDArrayImpl } from './ndarray'
import { lstsq } from './linalg'

/**
 * Least squares polynomial fit
 * Fit a polynomial p(x) = p[0] * x^deg + ... + p[deg] of degree deg to points (x, y)
 */
export function polyfit<T extends DType>(
  x: NDArray<T>,
  y: NDArray<T>,
  deg: number,
): NDArray<T> {
  const xData = x.getData()
  const yData = y.getData()

  if (xData.shape.length !== 1 || yData.shape.length !== 1) {
    throw new Error('polyfit requires 1D arrays')
  }

  if (xData.buffer.length !== yData.buffer.length) {
    throw new Error('x and y must have same length')
  }

  const n = xData.buffer.length

  if (n <= deg) {
    throw new Error('Number of data points must exceed polynomial degree')
  }

  // Build Vandermonde matrix: V[i, j] = x[i]^(deg - j)
  const vBuffer = createTypedArray(n * (deg + 1), xData.dtype)

  for (let i = 0; i < n; i++) {
    const xi = xData.buffer[i]
    for (let j = 0; j <= deg; j++) {
      vBuffer[i * (deg + 1) + j] = Math.pow(xi, deg - j)
    }
  }

  const V = new NDArrayImpl({
    buffer: vBuffer,
    shape: [n, deg + 1],
    strides: [deg + 1, 1],
    dtype: xData.dtype,
  })

  // Solve V * p = y using least squares
  const result = lstsq(V, y)

  return result.x as NDArray<T>
}

/**
 * Evaluate polynomial at specific values
 * p(x) = p[0] * x^n + p[1] * x^(n-1) + ... + p[n]
 */
export function polyval<T extends DType>(p: NDArray<T>, x: NDArray<T>): NDArray<T> {
  const pData = p.getData()
  const xData = x.getData()

  if (pData.shape.length !== 1) {
    throw new Error('polyval requires 1D coefficient array')
  }

  if (xData.shape.length !== 1) {
    throw new Error('polyval requires 1D x array')
  }

  const n = pData.buffer.length
  const result = createTypedArray(xData.buffer.length, xData.dtype)

  // Evaluate using Horner's method: p(x) = p[0] + x * (p[1] + x * (p[2] + ...))
  for (let i = 0; i < xData.buffer.length; i++) {
    const xi = xData.buffer[i]
    let value = pData.buffer[0]

    for (let j = 1; j < n; j++) {
      value = value * xi + pData.buffer[j]
    }

    result[i] = value
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [...xData.shape],
    strides: [...xData.strides],
    dtype: xData.dtype,
  })
}

/**
 * Find roots of a polynomial
 * Computes the roots of p(x) = p[0] * x^n + p[1] * x^(n-1) + ... + p[n]
 * Uses companion matrix eigenvalue method
 */
export function roots<T extends DType>(p: NDArray<T>): NDArray<'float64'> {
  const pData = p.getData()

  if (pData.shape.length !== 1) {
    throw new Error('roots requires 1D coefficient array')
  }

  const n = pData.buffer.length

  if (n === 1) {
    // Constant polynomial has no roots
    return new NDArrayImpl({
      buffer: new Float64Array(0),
      shape: [0],
      strides: [1],
      dtype: 'float64',
    })
  }

  if (n === 2) {
    // Linear: ax + b = 0 => x = -b/a
    const root = -pData.buffer[1] / pData.buffer[0]
    return new NDArrayImpl({
      buffer: Float64Array.from([root]),
      shape: [1],
      strides: [1],
      dtype: 'float64',
    })
  }

  if (n === 3) {
    // Quadratic: ax^2 + bx + c = 0
    const a = pData.buffer[0]
    const b = pData.buffer[1]
    const c = pData.buffer[2]

    const discriminant = b * b - 4 * a * c

    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant)
      const root1 = (-b + sqrtD) / (2 * a)
      const root2 = (-b - sqrtD) / (2 * a)
      return new NDArrayImpl({
        buffer: Float64Array.from([root1, root2]),
        shape: [2],
        strides: [1],
        dtype: 'float64',
      })
    } else {
      // Complex roots - return real parts only for now
      const realPart = -b / (2 * a)
      return new NDArrayImpl({
        buffer: Float64Array.from([realPart, realPart]),
        shape: [2],
        strides: [1],
        dtype: 'float64',
      })
    }
  }

  // For higher degree polynomials, we need eigenvalues of companion matrix
  // This is a simplified version - full implementation would use eig()
  // For now, throw error for degrees > 2
  throw new Error('roots() only supports polynomials up to degree 2. Use NumPy for higher degrees.')
}

/**
 * Return the derivative of a polynomial
 * For p(x) = p[0] * x^n + p[1] * x^(n-1) + ... + p[n]
 * Returns p'(x) = n*p[0] * x^(n-1) + (n-1)*p[1] * x^(n-2) + ...
 */
export function polyder<T extends DType>(p: NDArray<T>, m = 1): NDArray<T> {
  const pData = p.getData()

  if (pData.shape.length !== 1) {
    throw new Error('polyder requires 1D coefficient array')
  }

  if (m < 0) {
    throw new Error('Derivative order must be non-negative')
  }

  if (m === 0) {
    // Return copy
    const buffer = createTypedArray(pData.buffer.length, pData.dtype)
    for (let i = 0; i < pData.buffer.length; i++) {
      buffer[i] = pData.buffer[i]
    }
    return new NDArrayImpl({
      buffer,
      shape: [...pData.shape],
      strides: [...pData.strides],
      dtype: pData.dtype,
    })
  }

  let coeffs = Array.from(pData.buffer)
  const n = coeffs.length

  if (n === 0) {
    return p
  }

  // Take m derivatives
  for (let deriv = 0; deriv < m; deriv++) {
    if (coeffs.length <= 1) {
      // Derivative of constant is zero
      coeffs = [0]
      break
    }

    const newCoeffs: number[] = []
    for (let i = 0; i < coeffs.length - 1; i++) {
      const power = coeffs.length - 1 - i
      newCoeffs.push(coeffs[i] * power)
    }
    coeffs = newCoeffs
  }

  const buffer = createTypedArray(coeffs.length, pData.dtype)
  for (let i = 0; i < coeffs.length; i++) {
    buffer[i] = coeffs[i]
  }

  return new NDArrayImpl({
    buffer,
    shape: [coeffs.length],
    strides: [1],
    dtype: pData.dtype,
  })
}

/**
 * Return the antiderivative (integral) of a polynomial
 * For p(x) = p[0] * x^n + p[1] * x^(n-1) + ... + p[n]
 * Returns ∫p(x)dx = p[0]/(n+1) * x^(n+1) + p[1]/n * x^n + ... + k
 */
export function polyint<T extends DType>(p: NDArray<T>, m = 1, k: number | number[] = 0): NDArray<T> {
  const pData = p.getData()

  if (pData.shape.length !== 1) {
    throw new Error('polyint requires 1D coefficient array')
  }

  if (m < 0) {
    throw new Error('Integration order must be non-negative')
  }

  if (m === 0) {
    // Return copy
    const buffer = createTypedArray(pData.buffer.length, pData.dtype)
    for (let i = 0; i < pData.buffer.length; i++) {
      buffer[i] = pData.buffer[i]
    }
    return new NDArrayImpl({
      buffer,
      shape: [...pData.shape],
      strides: [...pData.strides],
      dtype: pData.dtype,
    })
  }

  let coeffs = Array.from(pData.buffer)
  const constants = Array.isArray(k) ? k : [k]

  // Take m integrals
  for (let integ = 0; integ < m; integ++) {
    const newCoeffs: number[] = []
    const n = coeffs.length

    // Integrate: divide each coefficient by its new power
    for (let i = 0; i < n; i++) {
      const newPower = n - i
      newCoeffs.push(coeffs[i] / newPower)
    }

    // Add constant of integration
    const constant = integ < constants.length ? constants[integ] : 0
    newCoeffs.push(constant)

    coeffs = newCoeffs
  }

  const buffer = createTypedArray(coeffs.length, pData.dtype)
  for (let i = 0; i < coeffs.length; i++) {
    buffer[i] = coeffs[i]
  }

  return new NDArrayImpl({
    buffer,
    shape: [coeffs.length],
    strides: [1],
    dtype: pData.dtype,
  })
}
