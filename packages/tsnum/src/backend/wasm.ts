// ===== WASM Backend =====
// High-performance WASM implementation

import type { DType, NDArrayData } from '../core/types'
import { broadcastShapes, broadcastTo, createTypedArray } from '../core/utils'
import type { Backend } from './types'

// Dynamic import of WASM module
type WASMModule = typeof import('../../wasm/tsnum_wasm.js')

/**
 * WASM backend using Rust implementation
 * Provides near-native performance with automatic fallback
 */
export class WASMBackend implements Backend {
  readonly name = 'wasm' as const
  private _isReady = false
  private wasmModule: WASMModule | null = null

  get isReady(): boolean {
    return this._isReady
  }

  async init(): Promise<void> {
    try {
      // Dynamic import of compiled WASM module
      const module = await import('../../wasm/tsnum_wasm.js')

      // Initialize WASM (loads .wasm file)
      await module.default()

      this.wasmModule = module
      this._isReady = true
    } catch (error) {
      throw new Error(`Failed to initialize WASM: ${error}`)
    }
  }

  // ===== Arithmetic Operations =====

  add(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    if (typeof b === 'number') {
      // Scalar operation
      const buffer = this.toFloat64Array(a.buffer)
      const result = this.module.add_scalar(buffer, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    // Array operation with broadcasting
    return this.elementwiseOp(a, b, (bufA, bufB) => this.module.add_arrays(bufA, bufB))
  }

  sub(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    if (typeof b === 'number') {
      const buffer = this.toFloat64Array(a.buffer)
      const result = this.module.sub_scalar(buffer, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    return this.elementwiseOp(a, b, (bufA, bufB) => this.module.sub_arrays(bufA, bufB))
  }

  mul(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    if (typeof b === 'number') {
      const buffer = this.toFloat64Array(a.buffer)
      const result = this.module.mul_scalar(buffer, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    return this.elementwiseOp(a, b, (bufA, bufB) => this.module.mul_arrays(bufA, bufB))
  }

  div(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    if (typeof b === 'number') {
      const buffer = this.toFloat64Array(a.buffer)
      const result = this.module.div_scalar(buffer, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    return this.elementwiseOp(a, b, (bufA, bufB) => this.module.div_arrays(bufA, bufB))
  }

  pow(a: NDArrayData, exponent: number): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.pow_scalar(buffer, exponent)
    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  // ===== Reductions =====

  sum(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.sum(buffer)
  }

  mean(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.mean(buffer)
  }

  max(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.max(buffer)
  }

  min(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.min(buffer)
  }

  std(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.std(buffer)
  }

  variance(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.variance(buffer)
  }

  // ===== Helper Methods =====

  private ensureReady(): void {
    if (!this._isReady || !this.wasmModule) {
      throw new Error('WASM backend not initialized')
    }
  }

  private get module(): WASMModule {
    // Safe to assert non-null after ensureReady() check
    // biome-ignore lint/style/noNonNullAssertion: ensureReady() guarantees this is non-null
    return this.wasmModule!
  }

  private toFloat64Array(
    buffer: Float64Array | Int32Array | Int16Array | Int8Array | Float32Array,
  ): Float64Array {
    if (buffer instanceof Float64Array) {
      return buffer
    }
    // Convert to Float64Array for WASM
    return new Float64Array(buffer)
  }

  private toNDArrayData(result: Float64Array, shape: readonly number[], dtype: DType): NDArrayData {
    // Convert result back to requested dtype
    const buffer = dtype === 'float64' ? result : createTypedArray(result.length, dtype)

    if (dtype !== 'float64') {
      for (let i = 0; i < result.length; i++) {
        buffer[i] = result[i]
      }
    }

    // Calculate strides for C-contiguous layout
    const strides = new Array(shape.length)
    strides[shape.length - 1] = 1
    for (let i = shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * shape[i + 1]
    }

    return {
      buffer,
      shape: [...shape],
      strides,
      dtype,
    }
  }

  private elementwiseOp(
    a: NDArrayData,
    b: NDArrayData,
    op: (a: Float64Array, b: Float64Array) => Float64Array,
  ): NDArrayData {
    // Determine broadcast shape
    const resultShape = broadcastShapes(a.shape, b.shape)

    // Broadcast arrays to result shape if needed
    const aBroadcast = broadcastTo(a, resultShape)
    const bBroadcast = broadcastTo(b, resultShape)

    // Convert to Float64Array and perform WASM operation
    const bufA = this.toFloat64Array(aBroadcast.buffer)
    const bufB = this.toFloat64Array(bBroadcast.buffer)
    const result = op(bufA, bufB)

    return this.toNDArrayData(result, resultShape, a.dtype)
  }
}
