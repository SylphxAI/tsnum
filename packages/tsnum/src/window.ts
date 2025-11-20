// ===== Window Functions for Signal Processing =====

import type { DType } from './core/types'
import { createTypedArray } from './core/utils'
import type { NDArray } from './ndarray'
import { NDArray } from './ndarray'

/**
 * Return the Hamming window
 * The Hamming window is a taper formed by using a weighted cosine
 */
export function hamming<T extends DType = 'float64'>(M: number): NDArray<T> {
  if (M < 0) {
    throw new Error('Window length must be non-negative')
  }

  if (M === 0) {
    return new NDArray({
      buffer: createTypedArray(0, 'float64' as T),
      shape: [0],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  if (M === 1) {
    const buffer = createTypedArray(1, 'float64' as T)
    buffer[0] = 1
    return new NDArray({
      buffer,
      shape: [1],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  const buffer = createTypedArray(M, 'float64' as T)
  const alpha = 0.54
  const beta = 0.46

  for (let n = 0; n < M; n++) {
    buffer[n] = alpha - beta * Math.cos((2 * Math.PI * n) / (M - 1))
  }

  return new NDArray({
    buffer,
    shape: [M],
    strides: [1],
    dtype: 'float64' as T,
  })
}

/**
 * Return the Hann window (also known as Hanning window)
 * The Hann window is a taper formed by using a raised cosine
 */
export function hanning<T extends DType = 'float64'>(M: number): NDArray<T> {
  if (M < 0) {
    throw new Error('Window length must be non-negative')
  }

  if (M === 0) {
    return new NDArray({
      buffer: createTypedArray(0, 'float64' as T),
      shape: [0],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  if (M === 1) {
    const buffer = createTypedArray(1, 'float64' as T)
    buffer[0] = 1
    return new NDArray({
      buffer,
      shape: [1],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  const buffer = createTypedArray(M, 'float64' as T)

  for (let n = 0; n < M; n++) {
    buffer[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (M - 1))
  }

  return new NDArray({
    buffer,
    shape: [M],
    strides: [1],
    dtype: 'float64' as T,
  })
}

/**
 * Return the Blackman window
 * The Blackman window is a taper formed by using the first three terms of a summation of cosines
 */
export function blackman<T extends DType = 'float64'>(M: number): NDArray<T> {
  if (M < 0) {
    throw new Error('Window length must be non-negative')
  }

  if (M === 0) {
    return new NDArray({
      buffer: createTypedArray(0, 'float64' as T),
      shape: [0],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  if (M === 1) {
    const buffer = createTypedArray(1, 'float64' as T)
    buffer[0] = 1
    return new NDArray({
      buffer,
      shape: [1],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  const buffer = createTypedArray(M, 'float64' as T)
  const a0 = 0.42
  const a1 = 0.5
  const a2 = 0.08

  for (let n = 0; n < M; n++) {
    buffer[n] =
      a0 -
      a1 * Math.cos((2 * Math.PI * n) / (M - 1)) +
      a2 * Math.cos((4 * Math.PI * n) / (M - 1))
  }

  return new NDArray({
    buffer,
    shape: [M],
    strides: [1],
    dtype: 'float64' as T,
  })
}

/**
 * Return the Bartlett window (also known as triangular window)
 * The Bartlett window is a triangular window
 */
export function bartlett<T extends DType = 'float64'>(M: number): NDArray<T> {
  if (M < 0) {
    throw new Error('Window length must be non-negative')
  }

  if (M === 0) {
    return new NDArray({
      buffer: createTypedArray(0, 'float64' as T),
      shape: [0],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  if (M === 1) {
    const buffer = createTypedArray(1, 'float64' as T)
    buffer[0] = 1
    return new NDArray({
      buffer,
      shape: [1],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  const buffer = createTypedArray(M, 'float64' as T)

  for (let n = 0; n < M; n++) {
    if (n <= (M - 1) / 2) {
      buffer[n] = (2 * n) / (M - 1)
    } else {
      buffer[n] = 2 - (2 * n) / (M - 1)
    }
  }

  return new NDArray({
    buffer,
    shape: [M],
    strides: [1],
    dtype: 'float64' as T,
  })
}

/**
 * Return the Kaiser window
 * The Kaiser window is a taper formed by using a Bessel function
 */
export function kaiser<T extends DType = 'float64'>(M: number, beta = 0.0): NDArray<T> {
  if (M < 0) {
    throw new Error('Window length must be non-negative')
  }

  if (M === 0) {
    return new NDArray({
      buffer: createTypedArray(0, 'float64' as T),
      shape: [0],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  if (M === 1) {
    const buffer = createTypedArray(1, 'float64' as T)
    buffer[0] = 1
    return new NDArray({
      buffer,
      shape: [1],
      strides: [1],
      dtype: 'float64' as T,
    })
  }

  const buffer = createTypedArray(M, 'float64' as T)
  const alpha = (M - 1) / 2
  const i0Beta = besselI0(beta)

  for (let n = 0; n < M; n++) {
    const x = beta * Math.sqrt(1 - Math.pow((n - alpha) / alpha, 2))
    buffer[n] = besselI0(x) / i0Beta
  }

  return new NDArray({
    buffer,
    shape: [M],
    strides: [1],
    dtype: 'float64' as T,
  })
}

/**
 * Modified Bessel function of the first kind, order 0
 * Used by Kaiser window
 */
function besselI0(x: number): number {
  // Series approximation
  let sum = 1.0
  let term = 1.0
  const xSquaredOver4 = (x * x) / 4

  for (let k = 1; k < 50; k++) {
    term *= xSquaredOver4 / (k * k)
    sum += term

    if (term < 1e-12 * sum) {
      break
    }
  }

  return sum
}
