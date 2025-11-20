// ===== Math Functions =====
// Element-wise mathematical operations

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Element-wise absolute value
 */
export function abs<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.abs(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise sign (-1, 0, or 1)
 */
export function sign<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    newBuffer[i] = val > 0 ? 1 : val < 0 ? -1 : 0
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise square root
 */
export function sqrt<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.sqrt(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise exponential (e^x)
 */
export function exp<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.exp(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise natural logarithm
 */
export function log<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.log(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise base-10 logarithm
 */
export function log10<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.log10(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise sine
 */
export function sin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.sin(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise cosine
 */
export function cos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.cos(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise tangent
 */
export function tan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.tan(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc sine
 */
export function arcsin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.asin(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc cosine
 */
export function arccos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.acos(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc tangent
 */
export function arctan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.atan(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise round to nearest integer
 */
export function round<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.round(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise floor (round down)
 */
export function floor<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.floor(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise ceiling (round up)
 */
export function ceil<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.ceil(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise truncate (round towards zero)
 */
export function trunc<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.trunc(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise maximum of two arrays
 */
export function maximum<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for maximum')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = Math.max(aData.buffer[i], bData.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise minimum of two arrays
 */
export function minimum<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for minimum')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = Math.min(aData.buffer[i], bData.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise clip values to range [min, max]
 */
export function clip<T extends DType>(a: NDArray<T>, min: number, max: number): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    newBuffer[i] = val < min ? min : val > max ? max : val
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}
