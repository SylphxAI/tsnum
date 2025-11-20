// ===== Math Convenience Functions =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Convert angles from degrees to radians
 * @example deg2rad(array([0, 90, 180])) // [0, π/2, π]
 */
export function deg2rad<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = (data.buffer[i] * Math.PI) / 180
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Convert angles from radians to degrees
 * @example rad2deg(array([0, Math.PI/2, Math.PI])) // [0, 90, 180]
 */
export function rad2deg<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = (data.buffer[i] * 180) / Math.PI
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Element-wise hypotenuse: sqrt(x1^2 + x2^2)
 * More stable than manual computation
 * @example hypot(array([3, 4]), array([4, 3])) // [5, 5]
 */
export function hypot<T extends DType>(x1: NDArray<T>, x2: NDArray<T>): NDArray<T> {
  const data1 = x1.getData()
  const data2 = x2.getData()

  if (data1.buffer.length !== data2.buffer.length) {
    throw new Error('Arrays must have same size')
  }

  const result = createTypedArray(data1.buffer.length, data1.dtype)

  for (let i = 0; i < data1.buffer.length; i++) {
    result[i] = Math.hypot(data1.buffer[i], data2.buffer[i])
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data1.shape.slice(),
    strides: data1.strides.slice(),
    dtype: data1.dtype,
  })
}

/**
 * Normalized sinc function: sin(πx) / (πx)
 * sinc(0) = 1
 * @example sinc(array([0, 1, 2])) // [1, 0, 0]
 */
export function sinc<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    if (Math.abs(val) < 1e-10) {
      result[i] = 1.0
    } else {
      const pix = Math.PI * val
      result[i] = Math.sin(pix) / pix
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Cube root
 * @example cbrt(array([8, 27, 64])) // [2, 3, 4]
 */
export function cbrt<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = Math.cbrt(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Element-wise square: x^2
 * @example square(array([1, 2, 3])) // [1, 4, 9]
 */
export function square<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i] * data.buffer[i]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Element-wise reciprocal: 1/x
 * @example reciprocal(array([1, 2, 4])) // [1, 0.5, 0.25]
 */
export function reciprocal<T extends DType>(x: NDArray<T>): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = 1 / data.buffer[i]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Greatest common divisor
 * @example gcd(array([12, 15, 18]), array([8, 10, 24])) // [4, 5, 6]
 */
export function gcd<T extends DType>(x1: NDArray<T>, x2: NDArray<T>): NDArray<'int32'> {
  const data1 = x1.getData()
  const data2 = x2.getData()

  if (data1.buffer.length !== data2.buffer.length) {
    throw new Error('Arrays must have same size')
  }

  const result = new Int32Array(data1.buffer.length)

  for (let i = 0; i < data1.buffer.length; i++) {
    let a = Math.abs(Math.floor(data1.buffer[i]))
    let b = Math.abs(Math.floor(data2.buffer[i]))

    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }

    result[i] = a
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data1.shape.slice(),
    strides: data1.strides.slice(),
    dtype: 'int32',
  })
}

/**
 * Least common multiple
 * @example lcm(array([4, 6, 8]), array([6, 9, 12])) // [12, 18, 24]
 */
export function lcm<T extends DType>(x1: NDArray<T>, x2: NDArray<T>): NDArray<'int32'> {
  const data1 = x1.getData()
  const data2 = x2.getData()

  if (data1.buffer.length !== data2.buffer.length) {
    throw new Error('Arrays must have same size')
  }

  const result = new Int32Array(data1.buffer.length)

  for (let i = 0; i < data1.buffer.length; i++) {
    const a = Math.abs(Math.floor(data1.buffer[i]))
    const b = Math.abs(Math.floor(data2.buffer[i]))

    // LCM = (a * b) / GCD(a, b)
    let gcdVal = a
    let gcdB = b
    while (gcdB !== 0) {
      const temp = gcdB
      gcdB = gcdVal % gcdB
      gcdVal = temp
    }

    result[i] = (a * b) / gcdVal
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data1.shape.slice(),
    strides: data1.strides.slice(),
    dtype: 'int32',
  })
}

/**
 * Heaviside step function
 * H(x) = 0 if x < 0, H(0) = h0, H(x) = 1 if x > 0
 * @example heaviside(array([-1, 0, 1]), 0.5) // [0, 0.5, 1]
 */
export function heaviside<T extends DType>(x: NDArray<T>, h0 = 0.5): NDArray<T> {
  const data = x.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    if (val < 0) {
      result[i] = 0
    } else if (val === 0) {
      result[i] = h0
    } else {
      result[i] = 1
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: data.shape.slice(),
    strides: data.strides.slice(),
    dtype: data.dtype,
  })
}

/**
 * Returns quotient and remainder element-wise
 * @example divmod(array([10, 11, 12]), array([3, 3, 3])) // {quotient: [3, 3, 4], remainder: [1, 2, 0]}
 */
export function divmod<T extends DType>(
  x1: NDArray<T>,
  x2: NDArray<T>,
): { quotient: NDArray<T>; remainder: NDArray<T> } {
  const data1 = x1.getData()
  const data2 = x2.getData()

  if (data1.buffer.length !== data2.buffer.length) {
    throw new Error('Arrays must have same size')
  }

  const quotient = createTypedArray(data1.buffer.length, data1.dtype)
  const remainder = createTypedArray(data1.buffer.length, data1.dtype)

  for (let i = 0; i < data1.buffer.length; i++) {
    const a = data1.buffer[i]
    const b = data2.buffer[i]
    quotient[i] = Math.floor(a / b)
    remainder[i] = a % b
  }

  return {
    quotient: new NDArrayImpl({
      buffer: quotient,
      shape: data1.shape.slice(),
      strides: data1.strides.slice(),
      dtype: data1.dtype,
    }),
    remainder: new NDArrayImpl({
      buffer: remainder,
      shape: data1.shape.slice(),
      strides: data1.strides.slice(),
      dtype: data1.dtype,
    }),
  }
}
