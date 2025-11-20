import type { DType, NDArrayData } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

// ===== Pure Function Implementations =====

function scalarOp(
  a: NDArrayData,
  scalar: number,
  op: (a: number, b: number) => number,
): NDArrayData {
  const newBuffer = createTypedArray(a.buffer.length, a.dtype)

  for (let i = 0; i < a.buffer.length; i++) {
    newBuffer[i] = op(a.buffer[i], scalar)
  }

  return {
    buffer: newBuffer,
    shape: a.shape,
    strides: a.strides,
    dtype: a.dtype,
  }
}

function elementwiseOp(
  a: NDArrayData,
  b: NDArrayData,
  op: (a: number, b: number) => number,
): NDArrayData {
  // ASSUMPTION: Same shape (broadcasting not yet implemented)
  if (a.shape.length !== b.shape.length) {
    throw new Error('Shape mismatch: broadcasting not yet implemented')
  }

  for (let i = 0; i < a.shape.length; i++) {
    if (a.shape[i] !== b.shape[i]) {
      throw new Error('Shape mismatch: broadcasting not yet implemented')
    }
  }

  const newBuffer = createTypedArray(a.buffer.length, a.dtype)

  for (let i = 0; i < a.buffer.length; i++) {
    newBuffer[i] = op(a.buffer[i], b.buffer[i])
  }

  return {
    buffer: newBuffer,
    shape: a.shape,
    strides: a.strides,
    dtype: a.dtype,
  }
}

// ===== Arithmetic Operations (Pure Functions) =====

export function add<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarOp(aData, b, (x, y) => x + y))
  }

  return new NDArray(elementwiseOp(aData, b.getData(), (x, y) => x + y))
}

export function sub<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarOp(aData, b, (x, y) => x - y))
  }

  return new NDArray(elementwiseOp(aData, b.getData(), (x, y) => x - y))
}

export function mul<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarOp(aData, b, (x, y) => x * y))
  }

  return new NDArray(elementwiseOp(aData, b.getData(), (x, y) => x * y))
}

export function div<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const aData = a.getData()

  if (typeof b === 'number') {
    return new NDArray(scalarOp(aData, b, (x, y) => x / y))
  }

  return new NDArray(elementwiseOp(aData, b.getData(), (x, y) => x / y))
}

export function pow<T extends DType>(a: NDArray<T>, exponent: number): NDArray<T> {
  const aData = a.getData()
  return new NDArray(scalarOp(aData, exponent, (x, y) => x ** y))
}
