import { NDArray } from '../ndarray'
// ===== Array Information Utilities =====

import type { DType } from '../core/types'

/**
 * Return the number of dimensions of array
 */
export function ndim<T extends DType>(a: NDArray<T>): number {
  return a.getData().shape.length
}

/**
 * Return the number of elements in array
 */
export function size<T extends DType>(a: NDArray<T>, axis?: number): number {
  const data = a.getData()

  if (axis === undefined) {
    return data.buffer.length
  }

  if (axis < 0 || axis >= data.shape.length) {
    throw new Error(`Axis ${axis} out of bounds for array with ${data.shape.length} dimensions`)
  }

  return data.shape[axis]
}

/**
 * Return the shape of array as a new array
 */
export function shape<T extends DType>(a: NDArray<T>): number[] {
  return [...a.getData().shape]
}

/**
 * Return the size of one array element in bytes
 */
export function itemsize<T extends DType>(a: NDArray<T>): number {
  const dtype = a.getData().dtype

  switch (dtype) {
    case 'float64':
      return 8
    case 'float32':
      return 4
    case 'int32':
      return 4
    case 'int16':
      return 2
    case 'int8':
      return 1
    case 'uint32':
      return 4
    case 'uint16':
      return 2
    case 'uint8':
      return 1
    default:
      return 8 // default to float64
  }
}

/**
 * Return the total bytes consumed by the elements of the array
 */
export function nbytes<T extends DType>(a: NDArray<T>): number {
  const data = a.getData()
  return data.buffer.length * itemsize(a)
}
