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
