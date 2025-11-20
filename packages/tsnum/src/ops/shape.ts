import type { DType, NDArrayData } from '../core/types'
import { computeSize, computeStrides, indexToOffset } from '../core/utils'
import { NDArray } from '../ndarray'

// ===== Shape Operations (Pure Functions) =====

export function reshape<T extends DType>(a: NDArray<T>, shape: number[]): NDArray<T> {
  const newSize = computeSize(shape)
  if (newSize !== a.size) {
    throw new Error(`Cannot reshape array of size ${a.size} into shape ${shape}`)
  }

  const aData = a.getData()
  const newData: NDArrayData = {
    buffer: aData.buffer,
    shape,
    strides: computeStrides(shape),
    dtype: aData.dtype,
  }

  return new NDArray(newData)
}

export function transpose<T extends DType>(a: NDArray<T>): NDArray<T> {
  const aData = a.getData()

  if (a.ndim !== 2) {
    throw new Error('Transpose only supported for 2D arrays')
  }

  const [rows, cols] = a.shape
  const newShape = [cols, rows]
  const newStrides = computeStrides(newShape)
  const newBuffer = new (aData.buffer.constructor as any)(a.size)

  // Copy with transposed indices
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const srcOffset = indexToOffset([i, j], aData.strides)
      const dstOffset = indexToOffset([j, i], newStrides)
      newBuffer[dstOffset] = aData.buffer[srcOffset]
    }
  }

  const newData: NDArrayData = {
    buffer: newBuffer,
    shape: newShape,
    strides: newStrides,
    dtype: aData.dtype,
  }

  return new NDArray(newData)
}

export function flatten<T extends DType>(a: NDArray<T>): NDArray<T> {
  return reshape(a, [a.size])
}

/**
 * Remove axes of length one from array
 */
export function squeeze<T extends DType>(a: NDArray<T>, axis?: number): NDArray<T> {
  const aData = a.getData()
  const shape = aData.shape

  let newShape: number[]

  if (axis !== undefined) {
    // Remove specific axis if it has length 1
    if (axis < 0 || axis >= shape.length) {
      throw new Error(`axis ${axis} is out of bounds for array of dimension ${shape.length}`)
    }
    if (shape[axis] !== 1) {
      throw new Error('cannot select an axis which has size not equal to one')
    }

    newShape = [...shape.slice(0, axis), ...shape.slice(axis + 1)]
  } else {
    // Remove all axes with length 1
    newShape = shape.filter((dim) => dim !== 1)
  }

  // If all dimensions removed, return scalar as 1D array
  if (newShape.length === 0) {
    newShape = [1]
  }

  return reshape(a, newShape)
}

/**
 * Expand the shape of an array by inserting a new axis
 */
export function expandDims<T extends DType>(a: NDArray<T>, axis: number): NDArray<T> {
  const aData = a.getData()
  const shape = aData.shape

  // Normalize negative axis
  const normalizedAxis = axis < 0 ? shape.length + axis + 1 : axis

  if (normalizedAxis < 0 || normalizedAxis > shape.length) {
    throw new Error(`axis ${axis} is out of bounds for array of dimension ${shape.length}`)
  }

  // Insert new dimension
  const newShape = [...shape.slice(0, normalizedAxis), 1, ...shape.slice(normalizedAxis)]

  return reshape(a, newShape)
}

/**
 * Swap two axes of an array
 */
export function swapaxes<T extends DType>(a: NDArray<T>, axis1: number, axis2: number): NDArray<T> {
  const aData = a.getData()
  const shape = [...aData.shape]
  const ndim = shape.length

  // Normalize negative axes
  const ax1 = axis1 < 0 ? ndim + axis1 : axis1
  const ax2 = axis2 < 0 ? ndim + axis2 : axis2

  if (ax1 < 0 || ax1 >= ndim || ax2 < 0 || ax2 >= ndim) {
    throw new Error('axis out of bounds')
  }
  // Swap dimensions
  ;[shape[ax1], shape[ax2]] = [shape[ax2], shape[ax1]]

  // For now, only support swapping last two dimensions of 2D arrays
  if (ndim === 2 && ((ax1 === 0 && ax2 === 1) || (ax1 === 1 && ax2 === 0))) {
    return transpose(a)
  }

  throw new Error('swapaxes only supports swapping last two dimensions of 2D arrays for now')
}
