import type { DType, NDArrayData, TypedArray } from './types'
import { DTYPE_TO_TYPEDARRAY } from './types'

// ===== Shape utilities =====
export function computeSize(shape: readonly number[]): number {
  if (shape.length === 0) return 1
  return shape.reduce((acc, dim) => acc * dim, 1)
}

// Compute strides for C-contiguous (row-major) layout
export function computeStrides(shape: readonly number[]): number[] {
  const ndim = shape.length
  if (ndim === 0) return []

  const strides = new Array(ndim)
  strides[ndim - 1] = 1

  for (let i = ndim - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shape[i + 1]
  }

  return strides
}

// Convert multi-dimensional index to flat buffer index
export function indexToOffset(index: number[], strides: readonly number[]): number {
  let offset = 0
  for (let i = 0; i < index.length; i++) {
    offset += index[i] * strides[i]
  }
  return offset
}

// ===== TypedArray creation =====
export function createTypedArray(size: number, dtype: DType): TypedArray {
  const TypedArrayConstructor = DTYPE_TO_TYPEDARRAY[dtype]
  return new TypedArrayConstructor(size)
}

export function createFilledTypedArray(size: number, dtype: DType, value: number): TypedArray {
  const arr = createTypedArray(size, dtype)
  arr.fill(value)
  return arr
}

// ===== Shape validation =====
export function validateShape(shape: readonly number[]): void {
  for (const dim of shape) {
    if (!Number.isInteger(dim) || dim < 0) {
      throw new Error(`Invalid shape dimension: ${dim}. Must be non-negative integer.`)
    }
  }
}

// ===== Broadcasting utilities =====
export function broadcastShapes(shape1: readonly number[], shape2: readonly number[]): number[] {
  const ndim1 = shape1.length
  const ndim2 = shape2.length
  const ndim = Math.max(ndim1, ndim2)
  const result = new Array(ndim)

  for (let i = 0; i < ndim; i++) {
    const dim1 = i < ndim1 ? shape1[ndim1 - 1 - i] : 1
    const dim2 = i < ndim2 ? shape2[ndim2 - 1 - i] : 1

    if (dim1 === dim2) {
      result[ndim - 1 - i] = dim1
    } else if (dim1 === 1) {
      result[ndim - 1 - i] = dim2
    } else if (dim2 === 1) {
      result[ndim - 1 - i] = dim1
    } else {
      throw new Error(`Shapes ${shape1} and ${shape2} cannot be broadcast together`)
    }
  }

  return result
}

// Check if two shapes are broadcastable
export function canBroadcast(shape1: readonly number[], shape2: readonly number[]): boolean {
  try {
    broadcastShapes(shape1, shape2)
    return true
  } catch {
    return false
  }
}

// Broadcast array data to a target shape
export function broadcastTo(data: NDArrayData, targetShape: readonly number[]): NDArrayData {
  const { shape: sourceShape, buffer, dtype, strides: sourceStrides } = data

  // Check if broadcasting is valid
  const broadcastedShape = broadcastShapes(sourceShape, targetShape)
  if (broadcastedShape.join(',') !== targetShape.join(',')) {
    throw new Error(`Cannot broadcast shape ${sourceShape} to ${targetShape}`)
  }

  // If shapes are the same, no broadcasting needed
  if (
    sourceShape.length === targetShape.length &&
    sourceShape.every((dim, i) => dim === targetShape[i])
  ) {
    return data
  }

  // Create new buffer with broadcasted data
  const targetSize = computeSize(targetShape)
  const newBuffer = createTypedArray(targetSize, dtype)

  // Compute new strides for broadcasting
  // Dimensions with size 1 get stride 0 (repeat values)
  const newStrides = new Array(targetShape.length)
  const sourceDims = sourceShape.length
  const targetDims = targetShape.length

  for (let i = 0; i < targetDims; i++) {
    const targetIdx = targetDims - 1 - i
    const sourceIdx = sourceDims - 1 - i

    if (sourceIdx < 0) {
      // Source doesn't have this dimension, stride is 0
      newStrides[targetIdx] = 0
    } else if (sourceShape[sourceIdx] === 1) {
      // Source dim is 1, repeat the value, stride is 0
      newStrides[targetIdx] = 0
    } else {
      // Normal stride
      newStrides[targetIdx] = sourceStrides[sourceIdx]
    }
  }

  // Fill the broadcasted array (not used - using iterative approach below)

  // Iteratively fill the buffer
  let destIdx = 0
  const iterate = (axis: number, sourceOffset: number) => {
    if (axis === targetDims) {
      newBuffer[destIdx++] = buffer[sourceOffset]
      return
    }

    const sourceAxis = axis - (targetDims - sourceDims)
    for (let i = 0; i < targetShape[axis]; i++) {
      if (sourceAxis < 0 || sourceShape[sourceAxis] === 1) {
        // Broadcast this dimension (repeat the same slice)
        iterate(axis + 1, sourceOffset)
      } else {
        // Normal indexing
        iterate(axis + 1, sourceOffset + i * sourceStrides[sourceAxis])
      }
    }
  }

  iterate(0, 0)

  return {
    buffer: newBuffer,
    shape: targetShape,
    strides: computeStrides(targetShape),
    dtype,
  }
}
