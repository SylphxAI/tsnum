// ===== Complex Number Functions =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Return the real part of complex argument element-wise
 * For real input, returns a copy of the input
 *
 * @param a Input array
 * @returns Real part of the array
 *
 * @example
 * const x = array([1, 2, 3])
 * real(x) // [1, 2, 3]
 */
export function real<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Check if input has complex representation [real, imag]
  const shape = data.shape.slice()
  const isComplex = shape.length >= 2 && shape[shape.length - 1] === 2

  if (isComplex) {
    // Extract real part from [..., 2] shape
    const realShape = shape.slice(0, -1)
    const realSize = realShape.reduce((acc, val) => acc * val, 1)
    const result = createTypedArray(realSize, 'float64')

    for (let i = 0; i < realSize; i++) {
      result[i] = data.buffer[i * 2] // Real part at even indices
    }

    return new NDArray({
      buffer: result,
      shape: realShape,
      strides: computeStrides(realShape),
      dtype: 'float64',
    })
  }

  // Real input - return copy
  const result = createTypedArray(data.buffer.length, 'float64')
  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i]
  }

  return new NDArray({
    buffer: result,
    shape: shape,
    strides: data.strides.slice(),
    dtype: 'float64',
  })
}

/**
 * Return the imaginary part of complex argument element-wise
 * For real input, returns zeros
 *
 * @param a Input array
 * @returns Imaginary part of the array
 *
 * @example
 * const x = array([1, 2, 3])
 * imag(x) // [0, 0, 0]
 */
export function imag<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Check if input has complex representation [real, imag]
  const shape = data.shape.slice()
  const isComplex = shape.length >= 2 && shape[shape.length - 1] === 2

  if (isComplex) {
    // Extract imaginary part from [..., 2] shape
    const imagShape = shape.slice(0, -1)
    const imagSize = imagShape.reduce((acc, val) => acc * val, 1)
    const result = createTypedArray(imagSize, 'float64')

    for (let i = 0; i < imagSize; i++) {
      result[i] = data.buffer[i * 2 + 1] // Imaginary part at odd indices
    }

    return new NDArray({
      buffer: result,
      shape: imagShape,
      strides: computeStrides(imagShape),
      dtype: 'float64',
    })
  }

  // Real input - return zeros
  const result = createTypedArray(data.buffer.length, 'float64')
  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = 0
  }

  return new NDArray({
    buffer: result,
    shape: shape,
    strides: data.strides.slice(),
    dtype: 'float64',
  })
}

/**
 * Return the angle (argument) of complex numbers element-wise
 * angle = atan2(imag, real)
 *
 * @param a Input array
 * @param deg If true, return angle in degrees (default: false, radians)
 * @returns Angle of complex numbers
 *
 * @example
 * const z = array([[1, 1], [1, -1]]) // Complex: 1+i, 1-i
 * angle(z) // [π/4, -π/4]
 */
export function angle<T extends DType>(a: NDArray<T>, deg: boolean = false): NDArray<'float64'> {
  const data = a.getData()
  const shape = data.shape.slice()
  const isComplex = shape.length >= 2 && shape[shape.length - 1] === 2

  if (isComplex) {
    // Extract angles from complex numbers
    const angleShape = shape.slice(0, -1)
    const angleSize = angleShape.reduce((acc, val) => acc * val, 1)
    const result = createTypedArray(angleSize, 'float64')

    for (let i = 0; i < angleSize; i++) {
      const re = data.buffer[i * 2]
      const im = data.buffer[i * 2 + 1]
      result[i] = Math.atan2(im, re)

      if (deg) {
        result[i] = (result[i] * 180) / Math.PI
      }
    }

    return new NDArray({
      buffer: result,
      shape: angleShape,
      strides: computeStrides(angleShape),
      dtype: 'float64',
    })
  }

  // Real input - angle is 0 for positive, π for negative
  const result = createTypedArray(data.buffer.length, 'float64')
  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    if (val >= 0) {
      result[i] = 0
    } else {
      result[i] = deg ? 180 : Math.PI
    }
  }

  return new NDArray({
    buffer: result,
    shape: shape,
    strides: data.strides.slice(),
    dtype: 'float64',
  })
}

/**
 * Return the complex conjugate element-wise
 * conj(a + bi) = a - bi
 *
 * @param a Input array
 * @returns Complex conjugate
 *
 * @example
 * const z = array([[1, 2], [3, -4]]) // Complex: 1+2i, 3-4i
 * conj(z) // [[1, -2], [3, 4]] => 1-2i, 3+4i
 */
export function conj<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()
  const shape = data.shape.slice()
  const isComplex = shape.length >= 2 && shape[shape.length - 1] === 2

  if (isComplex) {
    // Negate imaginary part
    const result = createTypedArray(data.buffer.length, 'float64')

    for (let i = 0; i < data.buffer.length; i += 2) {
      result[i] = data.buffer[i] // Real part unchanged
      result[i + 1] = -data.buffer[i + 1] // Negate imaginary part
    }

    return new NDArray({
      buffer: result,
      shape: shape,
      strides: data.strides.slice(),
      dtype: 'float64',
    })
  }

  // Real input - conjugate is the same
  const result = createTypedArray(data.buffer.length, 'float64')
  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i]
  }

  return new NDArray({
    buffer: result,
    shape: shape,
    strides: data.strides.slice(),
    dtype: 'float64',
  })
}

/**
 * Alias for conj
 */
export const conjugate = conj

/**
 * Helper: Compute strides from shape
 */
function computeStrides(shape: number[]): number[] {
  const strides = new Array(shape.length)
  strides[shape.length - 1] = 1
  for (let i = shape.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shape[i + 1]
  }
  return strides
}
