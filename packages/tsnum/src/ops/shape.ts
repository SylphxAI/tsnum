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
