// ===== Copy and View Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Return a deep copy of the array
 */
export function copy<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Create new buffer with copied data
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)
  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = data.buffer[i]
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: [...data.shape],
    strides: [...data.strides],
    dtype: data.dtype,
  })
}

/**
 * Return a view of the array (shares underlying data)
 * WARNING: Modifications to the view will affect the original array
 */
export function view<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Share the same buffer (shallow copy)
  return new NDArrayImpl({
    buffer: data.buffer,
    shape: [...data.shape],
    strides: [...data.strides],
    dtype: data.dtype,
  })
}

/**
 * Create a copy if needed, otherwise return the same array
 */
export function ascontiguousarray<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Check if already contiguous (strides match C-order)
  let expectedStride = 1
  let isContiguous = true

  for (let i = data.shape.length - 1; i >= 0; i--) {
    if (data.strides[i] !== expectedStride) {
      isContiguous = false
      break
    }
    expectedStride *= data.shape[i]
  }

  if (isContiguous) {
    return a
  }

  // Create contiguous copy
  return copy(a)
}
