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

  prod(a: NDArrayData): number {
    let product = 1
    for (let i = 0; i < a.buffer.length; i++) {
      product *= a.buffer[i]
    }
    return product
  }

  // ===== Linear Algebra Operations =====

  matmul(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.shape.length !== 2 || b.shape.length !== 2) {
      throw new Error('matmul requires 2D arrays')
    }

    const m = a.shape[0]
    const k = a.shape[1]
    const n = b.shape[1]

    if (k !== b.shape[0]) {
      throw new Error(`Shape mismatch: (${m}, ${k}) and (${b.shape[0]}, ${n})`)
    }

    const newBuffer = createTypedArray(m * n, a.dtype)

    // Matrix multiplication: C[i,j] = sum(A[i,k] * B[k,j])
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0
        for (let kIdx = 0; kIdx < k; kIdx++) {
          sum += a.buffer[i * k + kIdx] * b.buffer[kIdx * n + j]
        }
        newBuffer[i * n + j] = sum
      }
    }

    return {
      buffer: newBuffer,
      shape: [m, n],
      strides: [n, 1],
      dtype: a.dtype,
    }
  }

  dot(a: NDArrayData, b: NDArrayData): number {
    // 1D dot product (inner product)
    if (a.shape.length === 1 && b.shape.length === 1) {
      if (a.buffer.length !== b.buffer.length) {
        throw new Error('Arrays must have same length for dot product')
      }

      let result = 0
      for (let i = 0; i < a.buffer.length; i++) {
        result += a.buffer[i] * b.buffer[i]
      }
      return result
    }

    throw new Error('dot backend method only supports 1D arrays')
  }

  // ===== FFT Operations =====

  fft(a: NDArrayData): NDArrayData {
    const n = a.buffer.length

    // Check if n is power of 2
    if (n === 0 || (n & (n - 1)) !== 0) {
      throw new Error('FFT requires array length to be power of 2')
    }

    // Initialize real and imaginary parts
    const real = new Float64Array(n)
    const imag = new Float64Array(n)

    // Copy input to real part
    for (let i = 0; i < n; i++) {
      real[i] = a.buffer[i]
      imag[i] = 0
    }

    // Cooley-Tukey FFT
    this.fftRecursive(real, imag, n)

    // Interleave real and imaginary parts
    const result = createTypedArray(n * 2, a.dtype)
    for (let i = 0; i < n; i++) {
      result[i * 2] = real[i]
      result[i * 2 + 1] = imag[i]
    }

    return {
      buffer: result,
      shape: [n, 2],
      strides: [2, 1],
      dtype: 'float64',
    }
  }

  ifft(a: NDArrayData): NDArrayData {
    if (a.shape.length !== 2 || a.shape[1] !== 2) {
      throw new Error('IFFT requires [n, 2] array (real, imag pairs)')
    }

    const n = a.shape[0]

    // Check if n is power of 2
    if (n === 0 || (n & (n - 1)) !== 0) {
      throw new Error('IFFT requires array length to be power of 2')
    }

    // Extract real and imaginary parts
    const real = new Float64Array(n)
    const imag = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      real[i] = a.buffer[i * 2]
      imag[i] = a.buffer[i * 2 + 1]
    }

    // Conjugate
    for (let i = 0; i < n; i++) {
      imag[i] = -imag[i]
    }

    // FFT
    this.fftRecursive(real, imag, n)

    // Conjugate and scale
    const result = createTypedArray(n * 2, a.dtype)
    for (let i = 0; i < n; i++) {
      result[i * 2] = real[i] / n
      result[i * 2 + 1] = -imag[i] / n
    }

    return {
      buffer: result,
      shape: [n, 2],
      strides: [2, 1],
      dtype: 'float64',
    }
  }

  // ===== Math Functions =====

  abs(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.abs(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  sqrt(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.sqrt(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  cbrt(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.cbrt(a.buffer[i])
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  square(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = a.buffer[i] * a.buffer[i]
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  exp(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.exp(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  exp2(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = 2 ** a.buffer[i]
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  expm1(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.expm1(a.buffer[i])
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  log(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.log(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  log2(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.log2(a.buffer[i])
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  log10(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.log10(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  log1p(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.log1p(a.buffer[i])
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  round(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.round(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  floor(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.floor(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  ceil(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.ceil(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  trunc(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.trunc(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  maximum(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for maximum')
    }

    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.max(a.buffer[i], b.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  minimum(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for minimum')
    }

    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.min(a.buffer[i], b.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  clip(a: NDArrayData, min: number, max: number): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      const val = a.buffer[i]
      newBuffer[i] = val < min ? min : val > max ? max : val
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  sign(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      const val = a.buffer[i]
      newBuffer[i] = val > 0 ? 1 : val < 0 ? -1 : 0
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  mod(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    if (typeof b === 'number') {
      for (let i = 0; i < a.buffer.length; i++) {
        newBuffer[i] = a.buffer[i] % b
      }
    } else {
      if (a.buffer.length !== b.buffer.length) {
        throw new Error('Arrays must have same length for mod')
      }
      for (let i = 0; i < a.buffer.length; i++) {
        newBuffer[i] = a.buffer[i] % b.buffer[i]
      }
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  fmod(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    if (typeof b === 'number') {
      for (let i = 0; i < a.buffer.length; i++) {
        newBuffer[i] = a.buffer[i] % b
      }
    } else {
      if (a.buffer.length !== b.buffer.length) {
        throw new Error('Arrays must have same length for fmod')
      }
      for (let i = 0; i < a.buffer.length; i++) {
        newBuffer[i] = a.buffer[i] % b.buffer[i]
      }
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides: [...a.strides],
      dtype: a.dtype,
    }
  }

  arctan2(y: NDArrayData, x: NDArrayData): NDArrayData {
    if (y.buffer.length !== x.buffer.length) {
      throw new Error('Arrays must have same length for arctan2')
    }

    const newBuffer = createTypedArray(y.buffer.length, y.dtype)

    for (let i = 0; i < y.buffer.length; i++) {
      newBuffer[i] = Math.atan2(y.buffer[i], x.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: [...y.shape],
      strides: [...y.strides],
      dtype: y.dtype,
    }
  }

  deg2rad(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = (a.buffer[i] * Math.PI) / 180
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  rad2deg(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = (a.buffer[i] * 180) / Math.PI
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  hypot(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same size for hypot')
    }

    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.hypot(a.buffer[i], b.buffer[i])
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  reciprocal(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, 'float64')

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = 1 / a.buffer[i]
    }

    // Calculate strides for result shape
    const strides = new Array(a.shape.length)
    strides[a.shape.length - 1] = 1
    for (let i = a.shape.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * a.shape[i + 1]
    }

    return {
      buffer: newBuffer,
      shape: [...a.shape],
      strides,
      dtype: 'float64',
    }
  }

  sin(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.sin(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  cos(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.cos(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  tan(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.tan(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  sinh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.sinh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  cosh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.cosh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  tanh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.tanh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  arcsin(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.asin(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  arccos(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.acos(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  arctan(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.atan(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  asinh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.asinh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  acosh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.acosh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  atanh(a: NDArrayData): NDArrayData {
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < a.buffer.length; i++) {
      newBuffer[i] = Math.atanh(a.buffer[i])
    }

    return {
      buffer: newBuffer,
      shape: a.shape,
      strides: a.strides,
      dtype: a.dtype,
    }
  }

  // ===== Linear Algebra (Advanced) =====

  inv(a: NDArrayData): NDArrayData {
    if (a.shape.length !== 2 || a.shape[0] !== a.shape[1]) {
      throw new Error('inv requires square 2D array')
    }

    const n = a.shape[0]

    if (n === 2) {
      const [a11, a12, a21, a22] = a.buffer
      const detVal = a11 * a22 - a12 * a21

      if (Math.abs(detVal) < 1e-10) {
        throw new Error('Matrix is singular')
      }

      const invBuffer = createTypedArray(4, a.dtype)
      invBuffer[0] = a22 / detVal
      invBuffer[1] = -a12 / detVal
      invBuffer[2] = -a21 / detVal
      invBuffer[3] = a11 / detVal

      return {
        buffer: invBuffer,
        shape: [2, 2],
        strides: [2, 1],
        dtype: a.dtype,
      }
    }

    if (n === 3) {
      const [a11, a12, a13, a21, a22, a23, a31, a32, a33] = a.buffer

      // Compute determinant
      const detVal =
        a11 * a22 * a33 +
        a12 * a23 * a31 +
        a13 * a21 * a32 -
        a13 * a22 * a31 -
        a12 * a21 * a33 -
        a11 * a23 * a32

      if (Math.abs(detVal) < 1e-10) {
        throw new Error('Matrix is singular')
      }

      // Compute adjugate matrix
      const invBuffer = createTypedArray(9, a.dtype)
      invBuffer[0] = (a22 * a33 - a23 * a32) / detVal
      invBuffer[1] = (a13 * a32 - a12 * a33) / detVal
      invBuffer[2] = (a12 * a23 - a13 * a22) / detVal
      invBuffer[3] = (a23 * a31 - a21 * a33) / detVal
      invBuffer[4] = (a11 * a33 - a13 * a31) / detVal
      invBuffer[5] = (a13 * a21 - a11 * a23) / detVal
      invBuffer[6] = (a21 * a32 - a22 * a31) / detVal
      invBuffer[7] = (a12 * a31 - a11 * a32) / detVal
      invBuffer[8] = (a11 * a22 - a12 * a21) / detVal

      return {
        buffer: invBuffer,
        shape: [3, 3],
        strides: [3, 1],
        dtype: a.dtype,
      }
    }

    throw new Error('inv only supports 2x2 and 3x3 matrices')
  }

  det(a: NDArrayData): number {
    if (a.shape.length !== 2 || a.shape[0] !== a.shape[1]) {
      throw new Error('det requires square 2D array')
    }

    const n = a.shape[0]

    if (n === 2) {
      return a.buffer[0] * a.buffer[3] - a.buffer[1] * a.buffer[2]
    }

    if (n === 3) {
      const [a11, a12, a13, a21, a22, a23, a31, a32, a33] = a.buffer
      return (
        a11 * a22 * a33 +
        a12 * a23 * a31 +
        a13 * a21 * a32 -
        a13 * a22 * a31 -
        a12 * a21 * a33 -
        a11 * a23 * a32
      )
    }

    throw new Error('det only supports 2x2 and 3x3 matrices')
  }

  transpose(a: NDArrayData): NDArrayData {
    if (a.shape.length !== 2) {
      throw new Error('transpose requires 2D array')
    }

    const [rows, cols] = a.shape
    const newBuffer = createTypedArray(a.buffer.length, a.dtype)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newBuffer[j * rows + i] = a.buffer[i * cols + j]
      }
    }

    return {
      buffer: newBuffer,
      shape: [cols, rows],
      strides: [rows, 1],
      dtype: a.dtype,
    }
  }

  trace(a: NDArrayData): number {
    if (a.shape.length !== 2) {
      throw new Error('trace requires 2D array')
    }

    const n = Math.min(a.shape[0], a.shape[1])
    const stride = a.shape[1] + 1

    let sum = 0
    for (let i = 0; i < n; i++) {
      sum += a.buffer[i * stride]
    }
    return sum
  }

  outer(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.shape.length !== 1 || b.shape.length !== 1) {
      throw new Error('outer requires 1D arrays')
    }

    const m = a.buffer.length
    const n = b.buffer.length
    const newBuffer = createTypedArray(m * n, a.dtype)

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        newBuffer[i * n + j] = a.buffer[i] * b.buffer[j]
      }
    }

    return {
      buffer: newBuffer,
      shape: [m, n],
      strides: [n, 1],
      dtype: a.dtype,
    }
  }

  inner(a: NDArrayData, b: NDArrayData): number {
    if (a.shape.length !== 1 || b.shape.length !== 1) {
      throw new Error('inner requires 1D arrays')
    }

    if (a.buffer.length !== b.buffer.length) {
      throw new Error('Arrays must have same length for inner product')
    }

    let result = 0
    for (let i = 0; i < a.buffer.length; i++) {
      result += a.buffer[i] * b.buffer[i]
    }
    return result
  }

  // ===== Helper Methods =====

  private fftRecursive(real: Float64Array, imag: Float64Array, n: number): void {
    if (n <= 1) return

    // Divide
    const halfN = n / 2
    const evenReal = new Float64Array(halfN)
    const evenImag = new Float64Array(halfN)
    const oddReal = new Float64Array(halfN)
    const oddImag = new Float64Array(halfN)

    for (let i = 0; i < halfN; i++) {
      evenReal[i] = real[i * 2]
      evenImag[i] = imag[i * 2]
      oddReal[i] = real[i * 2 + 1]
      oddImag[i] = imag[i * 2 + 1]
    }

    // Conquer
    this.fftRecursive(evenReal, evenImag, halfN)
    this.fftRecursive(oddReal, oddImag, halfN)

    // Combine
    for (let k = 0; k < halfN; k++) {
      const angle = (-2 * Math.PI * k) / n
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // Complex multiplication: twiddle * odd[k]
      const tReal = cos * oddReal[k] - sin * oddImag[k]
      const tImag = cos * oddImag[k] + sin * oddReal[k]

      // Butterfly operation
      real[k] = evenReal[k] + tReal
      imag[k] = evenImag[k] + tImag
      real[k + halfN] = evenReal[k] - tReal
      imag[k + halfN] = evenImag[k] - tImag
    }
  }

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
