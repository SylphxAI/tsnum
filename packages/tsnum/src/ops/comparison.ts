import type { NDArrayData } from '../core/types'
import { NDArray } from '../ndarray'

// ===== Pure Function Implementations =====

function scalarCompare(
  a: NDArrayData,
  scalar: number,
  op: (a: number, b: number) => boolean,
): NDArrayData {
  const newBuffer = new Uint8Array(a.buffer.length)

  for (let i = 0; i < a.buffer.length; i++) {
    newBuffer[i] = op(a.buffer[i], scalar) ? 1 : 0
  }

  return {
    buffer: newBuffer,
    shape: a.shape,
    strides: a.strides,
    dtype: 'uint8',
  }
}

function elementwiseCompare(
  a: NDArrayData,
  b: NDArrayData,
  op: (a: number, b: number) => boolean,
): NDArrayData {
  // ASSUMPTION: Same shape
  if (a.shape.length !== b.shape.length) {
    throw new Error('Shape mismatch: broadcasting not yet implemented')
  }

  for (let i = 0; i < a.shape.length; i++) {
    if (a.shape[i] !== b.shape[i]) {
      throw new Error('Shape mismatch: broadcasting not yet implemented')
    }
  }

  const newBuffer = new Uint8Array(a.buffer.length)

  for (let i = 0; i < a.buffer.length; i++) {
    newBuffer[i] = op(a.buffer[i], b.buffer[i]) ? 1 : 0
  }

  return {
    buffer: newBuffer,
    shape: a.shape,
    strides: a.strides,
    dtype: 'uint8',
  }
}

// ===== Comparison Operations (Pure Functions) =====

export function equal(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x === y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x === y))
}

export function less(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x < y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x < y))
}

export function greater(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x > y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x > y))
}

export function lessEqual(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x <= y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x <= y))
}

export function greaterEqual(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x >= y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x >= y))
}

export function not_equal(a: NDArray, b: NDArray | number): NDArray<'uint8'> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarCompare(aData, b, (x, y) => x !== y))
  }

  return new NDArray(elementwiseCompare(aData, b.getData(), (x, y) => x !== y))
}

/**
 * Test if two arrays are equal (same shape and all elements equal)
 */
export function array_equal(a: NDArray, b: NDArray): boolean {
  const aData = a.getData()
  const bData = b.getData()

  // Check shape equality
  if (aData.shape.length !== bData.shape.length) {
    return false
  }

  for (let i = 0; i < aData.shape.length; i++) {
    if (aData.shape[i] !== bData.shape[i]) {
      return false
    }
  }

  // Check element equality
  if (aData.buffer.length !== bData.buffer.length) {
    return false
  }

  for (let i = 0; i < aData.buffer.length; i++) {
    if (aData.buffer[i] !== bData.buffer[i]) {
      return false
    }
  }

  return true
}

/**
 * Test if two arrays are equivalent (same shape and values, possibly different types)
 */
export function array_equiv(a: NDArray, b: NDArray): boolean {
  const aData = a.getData()
  const bData = b.getData()

  // Check shape equality
  if (aData.shape.length !== bData.shape.length) {
    return false
  }

  for (let i = 0; i < aData.shape.length; i++) {
    if (aData.shape[i] !== bData.shape[i]) {
      return false
    }
  }

  // Check element equality (with type coercion)
  if (aData.buffer.length !== bData.buffer.length) {
    return false
  }

  for (let i = 0; i < aData.buffer.length; i++) {
    // Use loose equality to allow type coercion
    if (Number(aData.buffer[i]) !== Number(bData.buffer[i])) {
      return false
    }
  }

  return true
}
