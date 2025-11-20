// ===== Broadcasting Utilities =====

import type { DType } from '../core/types'
import { computeStrides, createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * View input as array with at least 1 dimension
 */
export function atleast_1d<T extends DType>(...arrays: NDArray<T>[]): NDArray<T>[] {
  return arrays.map((a) => {
    const data = a.getData()

    if (data.shape.length === 0) {
      // Scalar -> 1D array
      return new NDArray({
        buffer: data.buffer,
        shape: [1],
        strides: [1],
        dtype: data.dtype,
      })
    }

    // Already at least 1D
    return a
  })
}

/**
 * View input as array with at least 2 dimensions
 */
export function atleast_2d<T extends DType>(...arrays: NDArray<T>[]): NDArray<T>[] {
  return arrays.map((a) => {
    const data = a.getData()

    if (data.shape.length === 0) {
      // Scalar -> 2D array [1, 1]
      return new NDArray({
        buffer: data.buffer,
        shape: [1, 1],
        strides: [1, 1],
        dtype: data.dtype,
      })
    }

    if (data.shape.length === 1) {
      // 1D -> 2D array [1, n]
      return new NDArray({
        buffer: data.buffer,
        shape: [1, data.shape[0]],
        strides: [data.shape[0], 1],
        dtype: data.dtype,
      })
    }

    // Already at least 2D
    return a
  })
}

/**
 * View input as array with at least 3 dimensions
 */
export function atleast_3d<T extends DType>(...arrays: NDArray<T>[]): NDArray<T>[] {
  return arrays.map((a) => {
    const data = a.getData()

    if (data.shape.length === 0) {
      // Scalar -> 3D array [1, 1, 1]
      return new NDArray({
        buffer: data.buffer,
        shape: [1, 1, 1],
        strides: [1, 1, 1],
        dtype: data.dtype,
      })
    }

    if (data.shape.length === 1) {
      // 1D -> 3D array [1, n, 1]
      return new NDArray({
        buffer: data.buffer,
        shape: [1, data.shape[0], 1],
        strides: [data.shape[0], 1, 1],
        dtype: data.dtype,
      })
    }

    if (data.shape.length === 2) {
      // 2D -> 3D array [m, n, 1]
      return new NDArray({
        buffer: data.buffer,
        shape: [...data.shape, 1],
        strides: [...data.strides, 1],
        dtype: data.dtype,
      })
    }

    // Already at least 3D
    return a
  })
}

/**
 * Broadcast array to new shape
 */
export function broadcast_to<T extends DType>(a: NDArray<T>, shape: number[]): NDArray<T> {
  const data = a.getData()

  // Check if shapes are compatible for broadcasting
  if (!canBroadcast(data.shape, shape)) {
    throw new Error(`Cannot broadcast shape ${data.shape} to ${shape}`)
  }

  // If already same shape, return copy
  if (arraysEqual(data.shape, shape)) {
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[i] = data.buffer[i]
    }
    return new NDArray({
      buffer: newBuffer,
      shape: [...data.shape],
      strides: [...data.strides],
      dtype: data.dtype,
    })
  }

  // Create new array with broadcasted shape
  const totalSize = shape.reduce((a, b) => a * b, 1)
  const newBuffer = createTypedArray(totalSize, data.dtype)

  // Fill with broadcasted values
  fillBroadcasted(newBuffer, shape, data.buffer, data.shape)

  return new NDArray({
    buffer: newBuffer,
    shape: [...shape],
    strides: computeStrides(shape),
    dtype: data.dtype,
  })
}

/**
 * Broadcast arrays to common shape
 */
export function broadcast_arrays<T extends DType>(...arrays: NDArray<T>[]): NDArray<T>[] {
  if (arrays.length === 0) {
    return []
  }

  // Find broadcasted shape
  const shapes = arrays.map((a) => [...a.getData().shape])
  const broadcastedShape = broadcastShapes(...shapes)

  // Broadcast each array to common shape
  return arrays.map((a) => broadcast_to(a, broadcastedShape))
}

// Helper: Check if two arrays can be broadcast together
function canBroadcast(shape1: readonly number[], shape2: readonly number[]): boolean {
  const len1 = shape1.length
  const len2 = shape2.length
  const maxLen = Math.max(len1, len2)

  for (let i = 0; i < maxLen; i++) {
    const dim1 = i < len1 ? shape1[len1 - 1 - i] : 1
    const dim2 = i < len2 ? shape2[len2 - 1 - i] : 1

    if (dim1 !== dim2 && dim1 !== 1 && dim2 !== 1) {
      return false
    }
  }

  return true
}

// Helper: Compute broadcasted shape
function broadcastShapes(...shapes: readonly number[][]): number[] {
  if (shapes.length === 0) {
    return []
  }

  const maxLen = Math.max(...shapes.map((s) => s.length))
  const result: number[] = []

  for (let i = 0; i < maxLen; i++) {
    let maxDim = 1

    for (const shape of shapes) {
      const dim = i < shape.length ? shape[shape.length - 1 - i] : 1
      if (dim !== 1) {
        if (maxDim !== 1 && maxDim !== dim) {
          throw new Error(`Cannot broadcast shapes: ${shapes.join(', ')}`)
        }
        maxDim = dim
      }
    }

    result.unshift(maxDim)
  }

  return result
}

// Helper: Fill array with broadcasted values
function fillBroadcasted(
  dest: Float64Array | Float32Array | Int32Array | Int16Array | Int8Array | Uint32Array | Uint16Array | Uint8Array,
  destShape: readonly number[],
  src: Float64Array | Float32Array | Int32Array | Int16Array | Int8Array | Uint32Array | Uint16Array | Uint8Array,
  srcShape: readonly number[],
): void {
  const destSize = destShape.reduce((a, b) => a * b, 1)

  for (let i = 0; i < destSize; i++) {
    const destIndices = indexToIndices(i, destShape)
    const srcIndices = destIndices.map((idx, dim) => {
      const srcDim = dim - (destShape.length - srcShape.length)
      if (srcDim < 0) return 0
      return srcShape[srcDim] === 1 ? 0 : idx
    })

    const srcIndex = indicesToIndex(
      srcIndices.slice(destShape.length - srcShape.length),
      srcShape,
    )
    dest[i] = src[srcIndex]
  }
}

// Helper: Convert flat index to multi-dimensional indices
function indexToIndices(index: number, shape: readonly number[]): number[] {
  const indices: number[] = []
  let remaining = index

  for (let i = shape.length - 1; i >= 0; i--) {
    indices.unshift(remaining % shape[i])
    remaining = Math.floor(remaining / shape[i])
  }

  return indices
}

// Helper: Convert multi-dimensional indices to flat index
function indicesToIndex(indices: number[], shape: readonly number[]): number {
  let index = 0
  let stride = 1

  for (let i = shape.length - 1; i >= 0; i--) {
    index += indices[i] * stride
    stride *= shape[i]
  }

  return index
}

// Helper: Check if two arrays are equal
function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
