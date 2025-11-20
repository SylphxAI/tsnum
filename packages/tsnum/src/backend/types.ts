// ===== Backend Abstraction Layer =====
// WASM-first with automatic TS fallback

import type { DType, NDArrayData } from '../core/types'

/**
 * Backend interface - implemented by both WASM and TS
 */
export interface Backend {
  readonly name: 'wasm' | 'typescript'
  readonly isReady: boolean

  // Arithmetic operations
  add(a: NDArrayData, b: NDArrayData | number): NDArrayData
  sub(a: NDArrayData, b: NDArrayData | number): NDArrayData
  mul(a: NDArrayData, b: NDArrayData | number): NDArrayData
  div(a: NDArrayData, b: NDArrayData | number): NDArrayData
  pow(a: NDArrayData, exponent: number): NDArrayData

  // Reductions
  sum(a: NDArrayData): number
  mean(a: NDArrayData): number
  max(a: NDArrayData): number
  min(a: NDArrayData): number
  std(a: NDArrayData): number
  variance(a: NDArrayData): number

  // Linear algebra operations
  matmul(a: NDArrayData, b: NDArrayData): NDArrayData
  dot(a: NDArrayData, b: NDArrayData): number

  // FFT operations (complex numbers as [real, imag] interleaved)
  fft(a: NDArrayData): NDArrayData
  ifft(a: NDArrayData): NDArrayData

  // Shape operations (pure TS - no WASM benefit)
  // reshape, transpose, etc. stay in TS
}

/**
 * Backend initialization result
 */
export type BackendInit = { success: true; backend: Backend } | { success: false; error: string }
