// ===== Cumulative Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Cumulative sum of array elements
 */
export function cumsum<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const buffer = createTypedArray(data.buffer.length, data.dtype)

  let sum = 0
  for (let i = 0; i < data.buffer.length; i++) {
    sum += Number(data.buffer[i])
    buffer[i] = sum
  }

  return new NDArray({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Cumulative product of array elements
 */
export function cumprod<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const buffer = createTypedArray(data.buffer.length, data.dtype)

  let prod = 1
  for (let i = 0; i < data.buffer.length; i++) {
    prod *= Number(data.buffer[i])
    buffer[i] = prod
  }

  return new NDArray({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Calculate the n-th discrete difference along the given axis
 */
export function diff<T extends DType>(a: NDArray<T>, n = 1): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('diff only supports 1D arrays for now')
  }

  if (n < 1) {
    throw new Error('n must be at least 1')
  }

  let current = data.buffer
  let currentLength = current.length

  // Apply difference n times
  for (let iteration = 0; iteration < n; iteration++) {
    if (currentLength <= 1) {
      // No more differences possible
      return new NDArray({
        buffer: createTypedArray(0, data.dtype),
        shape: [0],
        strides: [1],
        dtype: data.dtype,
      })
    }

    const newLength = currentLength - 1
    const newBuffer = createTypedArray(newLength, data.dtype)

    for (let i = 0; i < newLength; i++) {
      newBuffer[i] = Number(current[i + 1]) - Number(current[i])
    }

    current = newBuffer
    currentLength = newLength
  }

  return new NDArray({
    buffer: current,
    shape: [currentLength],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Compute gradient of an array
 */
export function gradient<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('gradient only supports 1D arrays for now')
  }

  const n = data.buffer.length
  if (n === 0) {
    return new NDArray({
      buffer: createTypedArray(0, data.dtype),
      shape: [0],
      strides: [1],
      dtype: data.dtype,
    })
  }

  if (n === 1) {
    return new NDArray({
      buffer: createTypedArray(1, data.dtype),
      shape: [1],
      strides: [1],
      dtype: data.dtype,
    })
  }

  const buffer = createTypedArray(n, data.dtype)

  // First element: forward difference
  buffer[0] = Number(data.buffer[1]) - Number(data.buffer[0])

  // Middle elements: central difference
  for (let i = 1; i < n - 1; i++) {
    buffer[i] = (Number(data.buffer[i + 1]) - Number(data.buffer[i - 1])) / 2
  }

  // Last element: backward difference
  buffer[n - 1] = Number(data.buffer[n - 1]) - Number(data.buffer[n - 2])

  return new NDArray({
    buffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}
