// ===== Array Manipulation =====
// Concatenation, stacking, splitting

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Concatenate arrays along an axis
 */
export function concat<T extends DType>(arrays: NDArray<T>[], axis = 0): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to concatenate')
  }

  const firstData = arrays[0].getData()
  const dtype = firstData.dtype

  // For 1D arrays or axis=0
  if (firstData.shape.length === 1 || axis === 0) {
    // Calculate total length
    let totalLength = 0
    for (const arr of arrays) {
      totalLength += arr.getData().buffer.length
    }

    // Create new buffer and copy data
    const newBuffer = createTypedArray(totalLength, dtype)
    let offset = 0

    for (const arr of arrays) {
      const data = arr.getData()
      for (let i = 0; i < data.buffer.length; i++) {
        newBuffer[offset + i] = data.buffer[i]
      }
      offset += data.buffer.length
    }

    // Calculate new shape
    if (firstData.shape.length === 1) {
      return new NDArrayImpl({
        buffer: newBuffer,
        shape: [totalLength],
        strides: [1],
        dtype,
      })
    }

    // For 2D concatenation along axis 0
    const cols = firstData.shape[1]
    const rows = totalLength / cols

    return new NDArrayImpl({
      buffer: newBuffer,
      shape: [rows, cols],
      strides: [cols, 1],
      dtype,
    })
  }

  throw new Error('concat only supports axis=0 for now')
}

/**
 * Stack arrays vertically (row-wise)
 */
export function vstack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  return concat(arrays, 0)
}

/**
 * Stack arrays horizontally (column-wise)
 */
export function hstack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to stack')
  }

  const firstData = arrays[0].getData()

  // For 1D arrays, just concatenate
  if (firstData.shape.length === 1) {
    return concat(arrays, 0)
  }

  throw new Error('hstack for 2D arrays not yet implemented')
}

/**
 * Stack arrays along a new axis
 */
export function stack<T extends DType>(arrays: NDArray<T>[], axis = 0): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to stack')
  }

  if (axis !== 0) {
    throw new Error('stack only supports axis=0 for now')
  }

  const firstData = arrays[0].getData()
  const dtype = firstData.dtype
  const elementsPerArray = firstData.buffer.length

  // All arrays must have same shape
  for (const arr of arrays) {
    if (arr.getData().buffer.length !== elementsPerArray) {
      throw new Error('All arrays must have the same shape for stack')
    }
  }

  // Create new buffer
  const totalLength = arrays.length * elementsPerArray
  const newBuffer = createTypedArray(totalLength, dtype)

  // Copy data
  let offset = 0
  for (const arr of arrays) {
    const data = arr.getData()
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[offset + i] = data.buffer[i]
    }
    offset += data.buffer.length
  }

  // New shape: [num_arrays, ...original_shape]
  const newShape = [arrays.length, ...firstData.shape]
  const newStrides = new Array(newShape.length)
  newStrides[newShape.length - 1] = 1
  for (let i = newShape.length - 2; i >= 0; i--) {
    newStrides[i] = newStrides[i + 1] * newShape[i + 1]
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: newShape,
    strides: newStrides,
    dtype,
  })
}

/**
 * Repeat elements of an array
 */
export function repeat<T extends DType>(a: NDArray<T>, repeats: number): NDArray<T> {
  const data = a.getData()
  const newLength = data.buffer.length * repeats
  const newBuffer = createTypedArray(newLength, data.dtype)

  let offset = 0
  for (let r = 0; r < repeats; r++) {
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[offset++] = data.buffer[i]
    }
  }

  const newShape =
    data.shape.length === 1 ? [newLength] : [data.shape[0] * repeats, ...data.shape.slice(1)]

  const newStrides = new Array(newShape.length)
  newStrides[newShape.length - 1] = 1
  for (let i = newShape.length - 2; i >= 0; i--) {
    newStrides[i] = newStrides[i + 1] * newShape[i + 1]
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: newShape,
    strides: newStrides,
    dtype: data.dtype,
  })
}
