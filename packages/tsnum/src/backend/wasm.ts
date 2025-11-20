// ===== WASM Backend =====
// High-performance WASM implementation

import type { DType, NDArrayData, TypedArray } from '../core/types'
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
      // Import the WASM module (Node.js target auto-initializes)
      const module = await import('../../wasm/tsnum_wasm.js')

      this.wasmModule = module as unknown as WASMModule
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

  prod(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.prod(buffer)
  }

  argmax(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.argmax(buffer)
  }

  argmin(a: NDArrayData): number {
    this.ensureReady()
    const buffer = this.toFloat64Array(a.buffer)
    return this.module.argmin(buffer)
  }

  // ===== Linear Algebra Operations =====

  matmul(a: NDArrayData, b: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.shape.length !== 2 || b.shape.length !== 2) {
      throw new Error('matmul requires 2D arrays')
    }

    const m = a.shape[0]
    const k = a.shape[1]
    const n = b.shape[1]

    if (k !== b.shape[0]) {
      throw new Error(`Shape mismatch: (${m}, ${k}) and (${b.shape[0]}, ${n})`)
    }

    const bufA = this.toFloat64Array(a.buffer)
    const bufB = this.toFloat64Array(b.buffer)

    // Call WASM matmul (we'll add this to WASM module)
    const result = this.module.matmul(bufA, bufB, m, k, n)

    return this.toNDArrayData(result, [m, n], a.dtype)
  }

  dot(a: NDArrayData, b: NDArrayData): number {
    this.ensureReady()

    // 1D dot product (inner product)
    if (a.shape.length === 1 && b.shape.length === 1) {
      if (a.buffer.length !== b.buffer.length) {
        throw new Error('Arrays must have same length for dot product')
      }

      const bufA = this.toFloat64Array(a.buffer)
      const bufB = this.toFloat64Array(b.buffer)

      // Call WASM dot
      return this.module.dot(bufA, bufB)
    }

    throw new Error('dot backend method only supports 1D arrays')
  }

  // ===== FFT Operations =====

  fft(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const n = a.buffer.length

    // Check if n is power of 2
    if (n === 0 || (n & (n - 1)) !== 0) {
      throw new Error('FFT requires array length to be power of 2')
    }

    const buffer = this.toFloat64Array(a.buffer)

    // Call WASM fft (returns interleaved [real, imag])
    const result = this.module.fft(buffer)

    // Always return float64 for FFT
    return this.toNDArrayData(result, [n, 2], 'float64')
  }

  ifft(a: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.shape.length !== 2 || a.shape[1] !== 2) {
      throw new Error('IFFT requires [n, 2] array (real, imag pairs)')
    }

    const n = a.shape[0]

    // Check if n is power of 2
    if (n === 0 || (n & (n - 1)) !== 0) {
      throw new Error('IFFT requires array length to be power of 2')
    }

    const buffer = this.toFloat64Array(a.buffer)

    // Call WASM ifft (returns interleaved [real, imag])
    const result = this.module.ifft(buffer, n)

    // Always return float64 for IFFT
    return this.toNDArrayData(result, [n, 2], 'float64')
  }

  // ===== Math Functions =====

  abs(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.abs_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  sqrt(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.sqrt_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  cbrt(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.cbrt_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  square(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.square_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  exp(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.exp_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  exp2(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.exp2_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  expm1(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.expm1_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  log(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.log_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  log2(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.log2_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  log10(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.log10_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  log1p(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.log1p_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  round(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.round_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  floor(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.floor_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  ceil(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.ceil_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  trunc(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.trunc_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  maximum(a: NDArrayData, b: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for maximum')
    }

    const bufferA = this.toFloat64Array(a.buffer)
    const bufferB = this.toFloat64Array(b.buffer)
    const result = this.module.maximum_arrays(bufferA, bufferB)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  minimum(a: NDArrayData, b: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for minimum')
    }

    const bufferA = this.toFloat64Array(a.buffer)
    const bufferB = this.toFloat64Array(b.buffer)
    const result = this.module.minimum_arrays(bufferA, bufferB)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  clip(a: NDArrayData, min: number, max: number): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.clip_array(buffer, min, max)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  sign(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.sign_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  mod(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    const bufferA = this.toFloat64Array(a.buffer)

    if (typeof b === 'number') {
      const result = this.module.mod_scalar(bufferA, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for mod')
    }

    const bufferB = this.toFloat64Array(b.buffer)
    const result = this.module.mod_arrays(bufferA, bufferB)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  fmod(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    this.ensureReady()

    const bufferA = this.toFloat64Array(a.buffer)

    if (typeof b === 'number') {
      const result = this.module.fmod_scalar(bufferA, b)
      return this.toNDArrayData(result, a.shape, a.dtype)
    }

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for fmod')
    }

    const bufferB = this.toFloat64Array(b.buffer)
    const result = this.module.fmod_arrays(bufferA, bufferB)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  arctan2(y: NDArrayData, x: NDArrayData): NDArrayData {
    this.ensureReady()

    if (y.buffer.length !== x.buffer.length) {
      throw new Error('Arrays must have same length for arctan2')
    }

    const bufferY = this.toFloat64Array(y.buffer)
    const bufferX = this.toFloat64Array(x.buffer)
    const result = this.module.arctan2_arrays(bufferY, bufferX)

    return this.toNDArrayData(result, y.shape, y.dtype)
  }

  deg2rad(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.deg2rad_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  rad2deg(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.rad2deg_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  hypot(a: NDArrayData, b: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same size for hypot')
    }

    const bufferA = this.toFloat64Array(a.buffer)
    const bufferB = this.toFloat64Array(b.buffer)
    const result = this.module.hypot_arrays(bufferA, bufferB)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  reciprocal(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.reciprocal_array(buffer)

    return this.toNDArrayData(result, a.shape, 'float64')
  }

  sin(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.sin_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  cos(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.cos_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  tan(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.tan_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  sinh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.sinh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  cosh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.cosh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  tanh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.tanh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  arcsin(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.arcsin_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  arccos(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.arccos_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  arctan(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.arctan_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  asinh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.asinh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  acosh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.acosh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  atanh(a: NDArrayData): NDArrayData {
    this.ensureReady()

    const buffer = this.toFloat64Array(a.buffer)
    const result = this.module.atanh_array(buffer)

    return this.toNDArrayData(result, a.shape, a.dtype)
  }

  // ===== Linear Algebra (Advanced) =====

  inv(a: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.shape.length !== 2 || a.shape[0] !== a.shape[1]) {
      throw new Error('inv requires square 2D array')
    }

    const n = a.shape[0]
    const buffer = this.toFloat64Array(a.buffer)

    try {
      const result = this.module.inv_matrix(buffer, n)
      return this.toNDArrayData(result, [n, n], a.dtype)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Matrix inversion failed')
    }
  }

  det(a: NDArrayData): number {
    this.ensureReady()

    if (a.shape.length !== 2 || a.shape[0] !== a.shape[1]) {
      throw new Error('det requires square 2D array')
    }

    const n = a.shape[0]
    const buffer = this.toFloat64Array(a.buffer)

    try {
      return this.module.det_matrix(buffer, n)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Determinant calculation failed')
    }
  }

  transpose(a: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.shape.length !== 2) {
      throw new Error('transpose requires 2D array')
    }

    const [rows, cols] = a.shape
    const buffer = this.toFloat64Array(a.buffer)

    const result = this.module.transpose_matrix(buffer, rows, cols)

    return this.toNDArrayData(result, [cols, rows], a.dtype)
  }

  trace(a: NDArrayData): number {
    this.ensureReady()

    if (a.shape.length !== 2) {
      throw new Error('trace requires 2D array')
    }

    const buffer = this.toFloat64Array(a.buffer)
    return this.module.trace_matrix(buffer, a.shape[0], a.shape[1])
  }

  outer(a: NDArrayData, b: NDArrayData): NDArrayData {
    this.ensureReady()

    if (a.shape.length !== 1 || b.shape.length !== 1) {
      throw new Error('outer requires 1D arrays')
    }

    const bufferA = this.toFloat64Array(a.buffer)
    const bufferB = this.toFloat64Array(b.buffer)

    const result = this.module.outer_product(bufferA, bufferB)

    return this.toNDArrayData(result, [a.buffer.length, b.buffer.length], a.dtype)
  }

  inner(a: NDArrayData, b: NDArrayData): number {
    this.ensureReady()

    if (a.shape.length !== 1 || b.shape.length !== 1) {
      throw new Error('inner requires 1D arrays')
    }

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for inner product')
    }

    const bufferA = this.toFloat64Array(a.buffer)
    const bufferB = this.toFloat64Array(b.buffer)

    return this.module.inner_product(bufferA, bufferB)
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

  private toFloat64Array(buffer: TypedArray): Float64Array {
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
