// ===== Array Utility Functions =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Trim zeros from beginning and/or end of 1D array
 */
export function trim_zeros<T extends DType>(
  arr: NDArray<T>,
  trim: 'f' | 'b' | 'fb' = 'fb',
): NDArray<T> {
  const data = arr.getData()

  if (data.shape.length !== 1) {
    throw new Error('trim_zeros only supports 1D arrays')
  }

  let start = 0
  let end = data.buffer.length

  // Trim front
  if (trim === 'f' || trim === 'fb') {
    while (start < end && data.buffer[start] === 0) {
      start++
    }
  }

  // Trim back
  if (trim === 'b' || trim === 'fb') {
    while (end > start && data.buffer[end - 1] === 0) {
      end--
    }
  }

  const length = end - start
  const result = createTypedArray(length, data.dtype)

  for (let i = 0; i < length; i++) {
    result[i] = data.buffer[start + i]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [length],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Differences between consecutive elements
 * Like diff but always returns n elements
 */
export function ediff1d<T extends DType>(
  arr: NDArray<T>,
  toEnd?: number | number[],
  toBegin?: number | number[],
): NDArray<T> {
  const data = arr.getData()

  if (data.buffer.length === 0) {
    return arr
  }

  // Calculate differences
  const diffs: number[] = []

  // Add toBegin values
  if (toBegin !== undefined) {
    const beginArray = Array.isArray(toBegin) ? toBegin : [toBegin]
    diffs.push(...beginArray)
  }

  // Add differences
  for (let i = 1; i < data.buffer.length; i++) {
    diffs.push(data.buffer[i] - data.buffer[i - 1])
  }

  // Add toEnd values
  if (toEnd !== undefined) {
    const endArray = Array.isArray(toEnd) ? toEnd : [toEnd]
    diffs.push(...endArray)
  }

  const result = createTypedArray(diffs.length, data.dtype)
  for (let i = 0; i < diffs.length; i++) {
    result[i] = diffs[i]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [diffs.length],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Round array elements to given number of decimals
 */
export function around<T extends DType>(arr: NDArray<T>, decimals = 0): NDArray<T> {
  const data = arr.getData()
  const result = createTypedArray(data.buffer.length, data.dtype)

  const multiplier = Math.pow(10, decimals)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = Math.round(data.buffer[i] * multiplier) / multiplier
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [...data.shape],
    strides: [...data.strides],
    dtype: data.dtype,
  })
}
