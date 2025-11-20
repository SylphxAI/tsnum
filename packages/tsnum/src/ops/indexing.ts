// ===== Indexing and Slicing Operations =====

import type { DType, NDArrayData } from '../core/types'
import { indexToOffset } from '../core/utils'
import { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

// ===== Types =====
export type SliceRange = number | [number, number] | [number, number, number] // value | [start, stop] | [start, stop, step]

// ===== Element Access =====

/**
 * Get single element from array at given indices
 * @example
 * const arr = array([[1, 2], [3, 4]])
 * at(arr, 0, 1) // 2
 * at(arr, 1, 0) // 3
 */
export function at<T extends DType>(arr: NDArray<T>, ...indices: number[]): number {
  const data = arr.getData()

  if (indices.length !== arr.ndim) {
    throw new Error(`Expected ${arr.ndim} indices, got ${indices.length}`)
  }

  // Handle negative indices (Python-style)
  const normalizedIndices = indices.map((idx, axis) => {
    const size = arr.shape[axis]
    const normalized = idx < 0 ? size + idx : idx

    if (normalized < 0 || normalized >= size) {
      throw new Error(`Index ${idx} out of bounds for axis ${axis} with size ${size}`)
    }

    return normalized
  })

  const offset = indexToOffset(normalizedIndices, data.strides)
  return data.buffer[offset]
}

// ===== Slicing =====

/**
 * Slice array along axes
 * @example
 * const arr = array([0, 1, 2, 3, 4])
 * slice(arr, [1, 4])        // [1, 2, 3]
 * slice(arr, [0, 5, 2])     // [0, 2, 4]
 *
 * const arr2d = array([[1, 2, 3], [4, 5, 6]])
 * slice(arr2d, [0, 2], [1, 3])  // [[2, 3], [5, 6]]
 */
export function slice<T extends DType>(arr: NDArray<T>, ...ranges: SliceRange[]): NDArray<T> {
  const data = arr.getData()

  if (ranges.length === 0 || ranges.length > arr.ndim) {
    throw new Error(`Invalid number of slice ranges: ${ranges.length}`)
  }

  // Normalize ranges to [start, stop, step]
  const normalizedRanges = ranges.map((range, axis) => {
    const size = arr.shape[axis]

    if (typeof range === 'number') {
      // Single index - slice of size 1
      const idx = range < 0 ? size + range : range
      return [idx, idx + 1, 1]
    }

    const [start, stop, step = 1] = range
    const normStart = start < 0 ? size + start : start
    const normStop = stop < 0 ? size + stop : stop

    return [normStart, normStop, step]
  })

  // Fill remaining axes with full range
  while (normalizedRanges.length < arr.ndim) {
    const axis = normalizedRanges.length
    normalizedRanges.push([0, arr.shape[axis], 1])
  }

  // Calculate new shape
  const newShape = normalizedRanges.map(([start, stop, step]) => Math.ceil((stop - start) / step))

  // Calculate new strides
  const newStrides = normalizedRanges.map(([, , step], axis) => data.strides[axis] * step)

  // Calculate starting offset
  const startIndices = normalizedRanges.map(([start]) => start)
  const startOffset = indexToOffset(startIndices, data.strides)

  // Create new buffer with sliced data
  const newSize = newShape.reduce((a, b) => a * b, 1)
  const newBuffer = new (data.buffer.constructor as any)(newSize)

  // Copy sliced data
  let destIdx = 0
  const copySlice = (axis: number, indices: number[]) => {
    if (axis === arr.ndim) {
      const offset = indexToOffset(indices, data.strides)
      newBuffer[destIdx++] = data.buffer[offset]
      return
    }

    const [start, stop, step] = normalizedRanges[axis]
    for (let i = start; i < stop; i += step) {
      copySlice(axis + 1, [...indices, i])
    }
  }

  copySlice(0, [])

  // Compute new strides for C-contiguous layout
  const { computeStrides } = require('../core/utils')
  const finalStrides = computeStrides(newShape)

  const newData: NDArrayData = {
    buffer: newBuffer,
    shape: newShape,
    strides: finalStrides,
    dtype: data.dtype,
  }

  return new NDArray<T>(newData)
}

// ===== Fancy Indexing (Array of indices) =====

/**
 * Select elements at specific indices
 * @example
 * const arr = array([10, 20, 30, 40, 50])
 * take(arr, [0, 2, 4])  // [10, 30, 50]
 */
export function take<T extends DType>(arr: NDArray<T>, indices: number[], axis = 0): NDArray<T> {
  const data = arr.getData()

  if (axis < 0 || axis >= arr.ndim) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  // For 1D arrays, simple case
  if (arr.ndim === 1) {
    const newSize = indices.length
    const newBuffer = new (data.buffer.constructor as any)(newSize)

    for (let i = 0; i < indices.length; i++) {
      let idx = indices[i]
      if (idx < 0) idx += arr.shape[0]

      if (idx < 0 || idx >= arr.shape[0]) {
        throw new Error(`Index ${indices[i]} out of bounds`)
      }

      newBuffer[i] = data.buffer[idx]
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: [newSize],
      strides: [1],
      dtype: data.dtype,
    }

    return new NDArray<T>(newData)
  }

  // For nD arrays, take along specific axis
  throw new Error('take() for multidimensional arrays not yet implemented')
}

/**
 * Return indices of non-zero elements in flattened array
 */
export function flatnonzero<T extends DType>(a: NDArray<T>): NDArray<'int32'> {
  const data = a.getData()
  const indices: number[] = []

  for (let i = 0; i < data.buffer.length; i++) {
    if (data.buffer[i] !== 0) {
      indices.push(i)
    }
  }

  const result = new Int32Array(indices)

  return new NDArrayImpl({
    buffer: result,
    shape: [indices.length],
    strides: [1],
    dtype: 'int32',
  })
}
