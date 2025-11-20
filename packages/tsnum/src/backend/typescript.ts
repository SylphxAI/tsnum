// ===== TypeScript Backend =====
// Pure TS implementation (fallback and reference)

import type { DType, NDArrayData } from '../core/types'
import { broadcastShapes, broadcastTo, createTypedArray } from '../core/utils'
import type { Backend } from './types'

/**
 * Pure TypeScript backend
 * Always available, used as fallback when WASM unavailable
 */
export class TypeScriptBackend implements Backend {
  readonly name = 'typescript' as const
  readonly isReady = true

  // ===== Arithmetic Operations =====

  add(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (typeof b === 'number') {
      return this.scalarOp(a, b, (x, y) => x + y)
    }
    return this.elementwiseOp(a, b, (x, y) => x + y)
  }

  sub(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (typeof b === 'number') {
      return this.scalarOp(a, b, (x, y) => x - y)
    }
    return this.elementwiseOp(a, b, (x, y) => x - y)
  }

  mul(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (typeof b === 'number') {
      return this.scalarOp(a, b, (x, y) => x * y)
    }
    return this.elementwiseOp(a, b, (x, y) => x * y)
  }

  div(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (typeof b === 'number') {
      return this.scalarOp(a, b, (x, y) => x / y)
    }
    return this.elementwiseOp(a, b, (x, y) => x / y)
  }

  pow(a: NDArrayData, exponent: number): NDArrayData {
    return this.scalarOp(a, exponent, (x, y) => x ** y)
  }

  // ===== Reductions =====

  sum(a: NDArrayData): number {
    let total = 0
    for (let i = 0; i < a.buffer.length; i++) {
      total += a.buffer[i]
    }
    return total
  }

  mean(a: NDArrayData): number {
    return this.sum(a) / a.buffer.length
  }

  max(a: NDArrayData): number {
    let maxVal = a.buffer[0]
    for (let i = 1; i < a.buffer.length; i++) {
      if (a.buffer[i] > maxVal) {
        maxVal = a.buffer[i]
      }
    }
    return maxVal
  }

  min(a: NDArrayData): number {
    let minVal = a.buffer[0]
    for (let i = 1; i < a.buffer.length; i++) {
      if (a.buffer[i] < minVal) {
        minVal = a.buffer[i]
      }
    }
    return minVal
  }

  std(a: NDArrayData): number {
    return Math.sqrt(this.variance(a))
  }

  variance(a: NDArrayData): number {
    const m = this.mean(a)
    let sumSquares = 0
    for (let i = 0; i < a.buffer.length; i++) {
      const diff = a.buffer[i] - m
      sumSquares += diff * diff
    }
    return sumSquares / a.buffer.length
  }

  // ===== Helper Methods =====

  private scalarOp(
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

  private elementwiseOp(
    a: NDArrayData,
    b: NDArrayData,
    op: (a: number, b: number) => number,
  ): NDArrayData {
    // Determine broadcast shape
    const resultShape = broadcastShapes(a.shape, b.shape)

    // Broadcast arrays to result shape if needed
    const aBroadcast = broadcastTo(a, resultShape)
    const bBroadcast = broadcastTo(b, resultShape)

    // Perform element-wise operation
    const resultSize = aBroadcast.buffer.length
    const newBuffer = createTypedArray(resultSize, a.dtype)

    for (let i = 0; i < resultSize; i++) {
      newBuffer[i] = op(aBroadcast.buffer[i], bBroadcast.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: resultShape,
      strides: aBroadcast.strides,
      dtype: a.dtype,
    }
  }
}
