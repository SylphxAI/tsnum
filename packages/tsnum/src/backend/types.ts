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
  prod(a: NDArrayData): number
  argmax(a: NDArrayData): number
  argmin(a: NDArrayData): number

  // Linear algebra operations
  matmul(a: NDArrayData, b: NDArrayData): NDArrayData
  dot(a: NDArrayData, b: NDArrayData): number

  // FFT operations (complex numbers as [real, imag] interleaved)
  fft(a: NDArrayData): NDArrayData
  ifft(a: NDArrayData): NDArrayData

  // Math functions (element-wise)
  abs(a: NDArrayData): NDArrayData
  sqrt(a: NDArrayData): NDArrayData
  cbrt(a: NDArrayData): NDArrayData
  square(a: NDArrayData): NDArrayData
  exp(a: NDArrayData): NDArrayData
  exp2(a: NDArrayData): NDArrayData
  expm1(a: NDArrayData): NDArrayData
  log(a: NDArrayData): NDArrayData
  log2(a: NDArrayData): NDArrayData
  log10(a: NDArrayData): NDArrayData
  log1p(a: NDArrayData): NDArrayData
  round(a: NDArrayData): NDArrayData
  floor(a: NDArrayData): NDArrayData
  ceil(a: NDArrayData): NDArrayData
  trunc(a: NDArrayData): NDArrayData
  maximum(a: NDArrayData, b: NDArrayData): NDArrayData
  minimum(a: NDArrayData, b: NDArrayData): NDArrayData
  clip(a: NDArrayData, min: number, max: number): NDArrayData
  sign(a: NDArrayData): NDArrayData
  mod(a: NDArrayData, b: NDArrayData | number): NDArrayData
  fmod(a: NDArrayData, b: NDArrayData | number): NDArrayData
  arctan2(y: NDArrayData, x: NDArrayData): NDArrayData
  deg2rad(a: NDArrayData): NDArrayData
  rad2deg(a: NDArrayData): NDArrayData
  hypot(a: NDArrayData, b: NDArrayData): NDArrayData
  reciprocal(a: NDArrayData): NDArrayData
  sin(a: NDArrayData): NDArrayData
  cos(a: NDArrayData): NDArrayData
  tan(a: NDArrayData): NDArrayData
  sinh(a: NDArrayData): NDArrayData
  cosh(a: NDArrayData): NDArrayData
  tanh(a: NDArrayData): NDArrayData
  arcsin(a: NDArrayData): NDArrayData
  arccos(a: NDArrayData): NDArrayData
  arctan(a: NDArrayData): NDArrayData
  asinh(a: NDArrayData): NDArrayData
  acosh(a: NDArrayData): NDArrayData
  atanh(a: NDArrayData): NDArrayData
  norm(a: NDArrayData, ord: number | 'fro'): number

  // Linear algebra (advanced) - 2x2 and 3x3 only for now
  inv(a: NDArrayData): NDArrayData
  det(a: NDArrayData): number
  transpose(a: NDArrayData): NDArrayData
  trace(a: NDArrayData): number
  outer(a: NDArrayData, b: NDArrayData): NDArrayData
  inner(a: NDArrayData, b: NDArrayData): number

  // Shape operations (pure TS - no WASM benefit)
  // reshape, etc. stay in TS
}

/**
 * Backend initialization result
 */
export type BackendInit = { success: true; backend: Backend } | { success: false; error: string }
