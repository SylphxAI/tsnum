// ===== Logical Operations =====
// Boolean logic and reduction operations

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Test whether any array element is true
 */
export function any<T extends DType>(a: NDArray<T>): boolean {
  const data = a.getData()
  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] !== 0) {
      return true
    }
  }
  return false
}

/**
 * Test whether all array elements are true
 */
export function all<T extends DType>(a: NDArray<T>): boolean {
  const data = a.getData()
  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] === 0) {
      return false
    }
  }
  return true
}

/**
 * Element-wise logical AND
 */
export function logicalAnd<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for logical_and')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = aData.buffer[i] !== 0 && bData.buffer[i] !== 0 ? 1 : 0
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise logical OR
 */
export function logicalOr<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for logical_or')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = aData.buffer[i] !== 0 || bData.buffer[i] !== 0 ? 1 : 0
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise logical NOT
 */
export function logicalNot<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = data.buffer[i] === 0 ? 1 : 0
  }

  return new NDArray({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise logical XOR
 */
export function logicalXor<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for logical_xor')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    const aBool = aData.buffer[i] !== 0
    const bBool = bData.buffer[i] !== 0
    newBuffer[i] = aBool !== bBool ? 1 : 0
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Return elements where condition is true
 */
export function where<T extends DType>(
  condition: NDArray<T>,
  x: NDArray<T>,
  y: NDArray<T>,
): NDArray<T> {
  const condData = condition.getData()
  const xData = x.getData()
  const yData = y.getData()

  if (
    condData.buffer.length !== xData.buffer.length ||
    condData.buffer.length !== yData.buffer.length
  ) {
    throw new Error('Arrays must have same length for where')
  }

  const newBuffer = createTypedArray(condData.buffer.length, xData.dtype)

  for (let i = 0; i < condData.buffer.length; i++) {
    newBuffer[i] = condData.buffer[i] !== 0 ? xData.buffer[i] : yData.buffer[i]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: xData.shape,
    strides: xData.strides,
    dtype: xData.dtype,
  })
}
