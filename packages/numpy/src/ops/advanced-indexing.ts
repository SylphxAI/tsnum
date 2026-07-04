// ===== Advanced Indexing Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Construct open mesh from multiple sequences
 * Returns N arrays, each with N dimensions
 */
export function ix_<T extends DType>(...arrays: NDArray<T>[]): NDArray<T>[] {
  if (arrays.length === 0) {
    return []
  }

  const shapes = arrays.map((a) => {
    const data = a.getData()
    if (data.shape.length !== 1) {
      throw new Error('ix_ requires 1D arrays')
    }
    return data.buffer.length
  })

  const result: NDArray<T>[] = []

  for (let i = 0; i < arrays.length; i++) {
    const data = arrays[i].getData()
    const newShape = new Array(arrays.length).fill(1)
    newShape[i] = shapes[i]

    // Create buffer with proper shape
    const totalSize = newShape.reduce((a, b) => a * b, 1)
    const newBuffer = createTypedArray(totalSize, data.dtype)

    // Fill with values from original array
    for (let j = 0; j < data.buffer.length; j++) {
      newBuffer[j] = data.buffer[j]
    }

    const strides = new Array(arrays.length).fill(0)
    strides[i] = 1

    result.push(
      new NDArray({
        buffer: newBuffer,
        shape: newShape,
        strides,
        dtype: data.dtype,
      }),
    )
  }

  return result
}

/**
 * Convert flat index to multi-dimensional indices
 */
export function unravel_index(indices: number | number[], shape: number[]): number[][] {
  const indicesArray = Array.isArray(indices) ? indices : [indices]
  const ndim = shape.length
  const result: number[][] = []

  for (const index of indicesArray) {
    if (index < 0) {
      throw new Error('unravel_index requires non-negative indices')
    }

    const totalSize = shape.reduce((a, b) => a * b, 1)
    if (index >= totalSize) {
      throw new Error(`Index ${index} out of bounds for shape ${shape}`)
    }

    const coords: number[] = []
    let remaining = index

    for (let i = ndim - 1; i >= 0; i--) {
      coords.unshift(remaining % shape[i])
      remaining = Math.floor(remaining / shape[i])
    }

    result.push(coords)
  }

  return result
}

/**
 * Convert multi-dimensional indices to flat index
 */
export function ravel_multi_index(
  multi_index: number[][] | number[],
  shape: number[],
): number | number[] {
  // Handle single index case
  if (!Array.isArray(multi_index[0])) {
    const coords = multi_index as number[]
    if (coords.length !== shape.length) {
      throw new Error('multi_index dimensions must match shape dimensions')
    }

    let index = 0
    let stride = 1

    for (let i = shape.length - 1; i >= 0; i--) {
      if (coords[i] < 0 || coords[i] >= shape[i]) {
        throw new Error(`Index ${coords[i]} out of bounds for axis ${i} with size ${shape[i]}`)
      }
      index += coords[i] * stride
      stride *= shape[i]
    }

    return index
  }

  // Handle multiple indices case
  const indices = multi_index as number[][]
  const result: number[] = []

  for (const coords of indices) {
    if (coords.length !== shape.length) {
      throw new Error('multi_index dimensions must match shape dimensions')
    }

    let index = 0
    let stride = 1

    for (let i = shape.length - 1; i >= 0; i--) {
      if (coords[i] < 0 || coords[i] >= shape[i]) {
        throw new Error(`Index ${coords[i]} out of bounds for axis ${i} with size ${shape[i]}`)
      }
      index += coords[i] * stride
      stride *= shape[i]
    }

    result.push(index)
  }

  return result
}

/**
 * Put values into array at specified indices
 */
export function put<T extends DType>(a: NDArray<T>, indices: number[], values: number[]): void {
  const data = a.getData()

  if (indices.length !== values.length) {
    throw new Error('indices and values must have same length')
  }

  for (let i = 0; i < indices.length; i++) {
    let idx = indices[i]

    // Handle negative indices
    if (idx < 0) {
      idx = data.buffer.length + idx
    }

    if (idx < 0 || idx >= data.buffer.length) {
      throw new Error(`Index ${indices[i]} out of bounds`)
    }

    data.buffer[idx] = values[i]
  }
}

/**
 * Put values into array where mask is true
 */
export function putmask<T extends DType>(
  a: NDArray<T>,
  mask: NDArray<T>,
  values: number | number[],
): void {
  const aData = a.getData()
  const maskData = mask.getData()

  if (aData.buffer.length !== maskData.buffer.length) {
    throw new Error('a and mask must have same size')
  }

  const valuesArray = Array.isArray(values) ? values : [values]
  let valueIdx = 0

  for (let i = 0; i < aData.buffer.length; i++) {
    if (maskData.buffer[i] !== 0) {
      aData.buffer[i] = valuesArray[valueIdx % valuesArray.length]
      valueIdx++
    }
  }
}

/**
 * Boolean indexing - extract elements where mask is true
 * @example
 * const a = array([1, 2, 3, 4, 5])
 * const mask = array([1, 0, 1, 0, 1])  // or boolean-like
 * booleanIndex(a, mask)  // [1, 3, 5]
 */
export function booleanIndex<T extends DType>(a: NDArray<T>, mask: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const maskData = mask.getData()

  if (aData.buffer.length !== maskData.buffer.length) {
    throw new Error('a and mask must have same size')
  }

  // Count true values
  let count = 0
  for (let i = 0; i < maskData.buffer.length; i++) {
    if (maskData.buffer[i] !== 0) {
      count++
    }
  }

  // Extract values
  const result = createTypedArray(count, aData.dtype)
  let idx = 0
  for (let i = 0; i < aData.buffer.length; i++) {
    if (maskData.buffer[i] !== 0) {
      result[idx++] = aData.buffer[i]
    }
  }

  return new NDArray({
    buffer: result,
    shape: [count],
    strides: [1],
    dtype: aData.dtype,
  })
}

/**
 * Integer array indexing - extract elements at specified indices
 * @example
 * const a = array([10, 20, 30, 40, 50])
 * const indices = array([0, 2, 4])
 * integerArrayIndex(a, indices)  // [10, 30, 50]
 */
export function integerArrayIndex<T extends DType>(
  a: NDArray<T>,
  indices: NDArray<'int32'>,
): NDArray<T> {
  const aData = a.getData()
  const indicesData = indices.getData()

  const result = createTypedArray(indicesData.buffer.length, aData.dtype)

  for (let i = 0; i < indicesData.buffer.length; i++) {
    let idx = indicesData.buffer[i]

    // Handle negative indices
    if (idx < 0) {
      idx = aData.buffer.length + idx
    }

    if (idx < 0 || idx >= aData.buffer.length) {
      throw new Error(`Index ${indicesData.buffer[i]} out of bounds`)
    }

    result[i] = aData.buffer[idx]
  }

  return new NDArray({
    buffer: result,
    shape: indicesData.shape.slice(),
    strides: indicesData.strides.slice(),
    dtype: aData.dtype,
  })
}
