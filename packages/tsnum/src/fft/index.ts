// ===== FFT Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Fast Fourier Transform (Cooley-Tukey algorithm)
 * Note: Input size must be power of 2
 */
export function fft<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('fft only supports 1D arrays')
  }

  const n = data.buffer.length

  // Check if n is power of 2
  if (n === 0 || (n & (n - 1)) !== 0) {
    throw new Error('fft requires array length to be power of 2')
  }

  // Real and imaginary parts
  const real = new Float64Array(n)
  const imag = new Float64Array(n)

  // Copy input to real part
  for (let i = 0; i < n; i++) {
    real[i] = data.buffer[i]
    imag[i] = 0
  }

  // Cooley-Tukey FFT
  fftRecursive(real, imag, n)

  // Interleave real and imaginary parts
  const result = createTypedArray(n * 2, 'float64')
  for (let i = 0; i < n; i++) {
    result[i * 2] = real[i]
    result[i * 2 + 1] = imag[i]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [n, 2],
    strides: [2, 1],
    dtype: 'float64',
  })
}

/**
 * Inverse Fast Fourier Transform
 */
export function ifft<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[1] !== 2) {
    throw new Error('ifft requires [n, 2] array (real, imag pairs)')
  }

  const n = data.shape[0]

  // Check if n is power of 2
  if (n === 0 || (n & (n - 1)) !== 0) {
    throw new Error('ifft requires array length to be power of 2')
  }

  // Extract real and imaginary parts
  const real = new Float64Array(n)
  const imag = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    real[i] = data.buffer[i * 2]
    imag[i] = data.buffer[i * 2 + 1]
  }

  // Conjugate
  for (let i = 0; i < n; i++) {
    imag[i] = -imag[i]
  }

  // FFT
  fftRecursive(real, imag, n)

  // Conjugate and scale
  const result = createTypedArray(n * 2, 'float64')
  for (let i = 0; i < n; i++) {
    result[i * 2] = real[i] / n
    result[i * 2 + 1] = -imag[i] / n
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [n, 2],
    strides: [2, 1],
    dtype: 'float64',
  })
}

/**
 * Real FFT (optimized for real-valued input)
 * Returns only positive frequencies (n/2 + 1 values)
 */
export function rfft<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('rfft only supports 1D arrays')
  }

  const n = data.buffer.length

  // Check if n is power of 2
  if (n === 0 || (n & (n - 1)) !== 0) {
    throw new Error('rfft requires array length to be power of 2')
  }

  // Compute full FFT
  const fullFft = fft(a)
  const fullData = fullFft.getData()

  // Return only positive frequencies (n/2 + 1 complex values)
  const resultSize = n / 2 + 1
  const result = createTypedArray(resultSize * 2, 'float64')

  for (let i = 0; i < resultSize; i++) {
    result[i * 2] = fullData.buffer[i * 2]
    result[i * 2 + 1] = fullData.buffer[i * 2 + 1]
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [resultSize, 2],
    strides: [2, 1],
    dtype: 'float64',
  })
}

/**
 * Inverse Real FFT
 */
export function irfft<T extends DType>(a: NDArray<T>, n?: number): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[1] !== 2) {
    throw new Error('irfft requires [n, 2] array (real, imag pairs)')
  }

  const inputSize = data.shape[0]
  const outputSize = n ?? (inputSize - 1) * 2

  // Reconstruct full spectrum (conjugate symmetry)
  const fullSize = outputSize
  const fullBuffer = createTypedArray(fullSize * 2, 'float64')

  // Copy positive frequencies
  for (let i = 0; i < inputSize; i++) {
    fullBuffer[i * 2] = data.buffer[i * 2]
    fullBuffer[i * 2 + 1] = data.buffer[i * 2 + 1]
  }

  // Mirror negative frequencies (conjugate)
  for (let i = 1; i < inputSize - 1; i++) {
    const idx = fullSize - i
    fullBuffer[idx * 2] = data.buffer[i * 2] // real part
    fullBuffer[idx * 2 + 1] = -data.buffer[i * 2 + 1] // conjugate imaginary
  }

  const fullSpectrum = new NDArrayImpl({
    buffer: fullBuffer,
    shape: [fullSize, 2],
    strides: [2, 1],
    dtype: 'float64',
  })

  // Inverse FFT
  const result = ifft(fullSpectrum)
  const resultData = result.getData()

  // Return only real part
  const realResult = createTypedArray(outputSize, 'float64')
  for (let i = 0; i < outputSize; i++) {
    realResult[i] = resultData.buffer[i * 2]
  }

  return new NDArrayImpl({
    buffer: realResult,
    shape: [outputSize],
    strides: [1],
    dtype: 'float64',
  })
}

// Helper: Recursive FFT implementation (Cooley-Tukey)
function fftRecursive(real: Float64Array, imag: Float64Array, n: number): void {
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
  fftRecursive(evenReal, evenImag, halfN)
  fftRecursive(oddReal, oddImag, halfN)

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
