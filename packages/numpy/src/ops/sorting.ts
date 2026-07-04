// ===== Sorting Operations =====

import { getBackend } from '../backend/manager'
import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Return indices that would sort an array
 */
export function argsort<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('argsort only supports 1D arrays')
  }

  // Create array of indices
  const indices = Array.from({ length: data.buffer.length }, (_, i) => i)

  // Sort indices by array values
  indices.sort((i, j) => data.buffer[i] - data.buffer[j])

  const newBuffer = new Int32Array(indices)

  return new NDArray({
    buffer: newBuffer,
    shape: data.shape,
    strides: [1],
    dtype: 'int32',
  })
}

/**
 * Sort an array
 */
export function sort<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('sort only supports 1D arrays')
  }

  const newBuffer = createTypedArray(data.buffer.length, data.dtype)
  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = data.buffer[i]
  }

  // Sort the new buffer
  const sorted = Array.from(newBuffer).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    newBuffer[i] = sorted[i]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Return index of maximum value (delegates to backend)
 */
export function argmax<T extends DType>(a: NDArray<T>): number {
  const backend = getBackend()
  return backend.argmax(a.getData())
}

/**
 * Return index of minimum value (delegates to backend)
 */
export function argmin<T extends DType>(a: NDArray<T>): number {
  const backend = getBackend()
  return backend.argmin(a.getData())
}
