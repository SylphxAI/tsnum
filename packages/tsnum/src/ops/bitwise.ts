// ===== Bitwise Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Compute bitwise AND of two arrays element-wise
 */
export function bitwise_and<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same size for bitwise operations')
  }

  const result = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    result[i] = Math.floor(aData.buffer[i]) & Math.floor(bData.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...aData.shape],
    strides: [...aData.strides],
    dtype: aData.dtype,
  })
}

/**
 * Compute bitwise OR of two arrays element-wise
 */
export function bitwise_or<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same size for bitwise operations')
  }

  const result = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    result[i] = Math.floor(aData.buffer[i]) | Math.floor(bData.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...aData.shape],
    strides: [...aData.strides],
    dtype: aData.dtype,
  })
}

/**
 * Compute bitwise XOR of two arrays element-wise
 */
export function bitwise_xor<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same size for bitwise operations')
  }

  const result = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    result[i] = Math.floor(aData.buffer[i]) ^ Math.floor(bData.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...aData.shape],
    strides: [...aData.strides],
    dtype: aData.dtype,
  })
}

/**
 * Compute bitwise NOT (inversion) element-wise
 */
export function bitwise_not<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = ~Math.floor(data.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...data.shape],
    strides: [...data.strides],
    dtype: data.dtype,
  })
}

/**
 * Shift bits to the left
 */
export function left_shift<T extends DType>(a: NDArray<T>, shift: number | NDArray<T>): NDArray<T> {
  const aData = a.getData()

  if (typeof shift === 'number') {
    const result = createTypedArray(aData.buffer.length, aData.dtype)

    for (let i = 0; i < aData.buffer.length; i++) {
      result[i] = Math.floor(aData.buffer[i]) << shift
    }

    return new NDArray({
      buffer: result,
      shape: [...aData.shape],
      strides: [...aData.strides],
      dtype: aData.dtype,
    })
  }

  const shiftData = shift.getData()

  if (aData.buffer.length !== shiftData.buffer.length) {
    throw new Error('Arrays must have same size for bitwise operations')
  }

  const result = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    result[i] = Math.floor(aData.buffer[i]) << Math.floor(shiftData.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...aData.shape],
    strides: [...aData.strides],
    dtype: aData.dtype,
  })
}

/**
 * Shift bits to the right
 */
export function right_shift<T extends DType>(
  a: NDArray<T>,
  shift: number | NDArray<T>,
): NDArray<T> {
  const aData = a.getData()

  if (typeof shift === 'number') {
    const result = createTypedArray(aData.buffer.length, aData.dtype)

    for (let i = 0; i < aData.buffer.length; i++) {
      result[i] = Math.floor(aData.buffer[i]) >> shift
    }

    return new NDArray({
      buffer: result,
      shape: [...aData.shape],
      strides: [...aData.strides],
      dtype: aData.dtype,
    })
  }

  const shiftData = shift.getData()

  if (aData.buffer.length !== shiftData.buffer.length) {
    throw new Error('Arrays must have same size for bitwise operations')
  }

  const result = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    result[i] = Math.floor(aData.buffer[i]) >> Math.floor(shiftData.buffer[i])
  }

  return new NDArray({
    buffer: result,
    shape: [...aData.shape],
    strides: [...aData.strides],
    dtype: aData.dtype,
  })
}

/**
 * Invert (bitwise NOT) element-wise
 * Alias for bitwise_not
 */
export function invert<T extends DType>(a: NDArray<T>): NDArray<T> {
  return bitwise_not(a)
}
