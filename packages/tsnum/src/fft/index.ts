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

// ===== 2D FFT Operations =====

/**
 * 2D Fast Fourier Transform
 * Applies FFT along both axes
 */
export function fft2<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('fft2 requires 2D array')
  }

  const [rows, cols] = data.shape

  // Check if dimensions are powers of 2
  if ((rows & (rows - 1)) !== 0 || (cols & (cols - 1)) !== 0) {
    throw new Error('fft2 requires dimensions to be powers of 2')
  }

  // Apply FFT to each row
  const rowResults = new Float64Array(rows * cols * 2)
  for (let i = 0; i < rows; i++) {
    const rowData = createTypedArray(cols, data.dtype)
    for (let j = 0; j < cols; j++) {
      rowData[j] = data.buffer[i * cols + j]
    }

    const rowArray = new NDArrayImpl({
      buffer: rowData,
      shape: [cols],
      strides: [1],
      dtype: data.dtype,
    })

    const rowFft = fft(rowArray)
    const rowFftData = rowFft.getData()

    for (let j = 0; j < cols; j++) {
      rowResults[i * cols * 2 + j * 2] = rowFftData.buffer[j * 2]
      rowResults[i * cols * 2 + j * 2 + 1] = rowFftData.buffer[j * 2 + 1]
    }
  }

  // Apply FFT to each column
  const result = new Float64Array(rows * cols * 2)
  for (let j = 0; j < cols; j++) {
    const colReal = new Float64Array(rows)
    const colImag = new Float64Array(rows)

    for (let i = 0; i < rows; i++) {
      colReal[i] = rowResults[i * cols * 2 + j * 2]
      colImag[i] = rowResults[i * cols * 2 + j * 2 + 1]
    }

    fftRecursive(colReal, colImag, rows)

    for (let i = 0; i < rows; i++) {
      result[i * cols * 2 + j * 2] = colReal[i]
      result[i * cols * 2 + j * 2 + 1] = colImag[i]
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [rows, cols, 2],
    strides: [cols * 2, 2, 1],
    dtype: 'float64',
  })
}

/**
 * 2D Inverse Fast Fourier Transform
 */
export function ifft2<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 3 || data.shape[2] !== 2) {
    throw new Error('ifft2 requires [rows, cols, 2] array (real, imag pairs)')
  }

  const [rows, cols] = data.shape

  // Check if dimensions are powers of 2
  if ((rows & (rows - 1)) !== 0 || (cols & (cols - 1)) !== 0) {
    throw new Error('ifft2 requires dimensions to be powers of 2')
  }

  // Apply IFFT to each row
  const rowResults = new Float64Array(rows * cols * 2)
  for (let i = 0; i < rows; i++) {
    const rowData = createTypedArray(cols * 2, 'float64')
    for (let j = 0; j < cols; j++) {
      rowData[j * 2] = data.buffer[i * cols * 2 + j * 2]
      rowData[j * 2 + 1] = data.buffer[i * cols * 2 + j * 2 + 1]
    }

    const rowArray = new NDArrayImpl({
      buffer: rowData,
      shape: [cols, 2],
      strides: [2, 1],
      dtype: 'float64',
    })

    const rowIfft = ifft(rowArray)
    const rowIfftData = rowIfft.getData()

    for (let j = 0; j < cols; j++) {
      rowResults[i * cols * 2 + j * 2] = rowIfftData.buffer[j * 2]
      rowResults[i * cols * 2 + j * 2 + 1] = rowIfftData.buffer[j * 2 + 1]
    }
  }

  // Apply IFFT to each column
  const result = new Float64Array(rows * cols * 2)
  for (let j = 0; j < cols; j++) {
    const colReal = new Float64Array(rows)
    const colImag = new Float64Array(rows)

    for (let i = 0; i < rows; i++) {
      colReal[i] = rowResults[i * cols * 2 + j * 2]
      colImag[i] = rowResults[i * cols * 2 + j * 2 + 1]
    }

    // Conjugate
    for (let i = 0; i < rows; i++) {
      colImag[i] = -colImag[i]
    }

    fftRecursive(colReal, colImag, rows)

    // Conjugate and scale
    for (let i = 0; i < rows; i++) {
      result[i * cols * 2 + j * 2] = colReal[i] / rows
      result[i * cols * 2 + j * 2 + 1] = -colImag[i] / rows
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [rows, cols, 2],
    strides: [cols * 2, 2, 1],
    dtype: 'float64',
  })
}

/**
 * 2D Real FFT (optimized for real-valued input)
 */
export function rfft2<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('rfft2 requires 2D array')
  }

  const [rows, cols] = data.shape

  // Check if dimensions are powers of 2
  if ((rows & (rows - 1)) !== 0 || (cols & (cols - 1)) !== 0) {
    throw new Error('rfft2 requires dimensions to be powers of 2')
  }

  // Compute full 2D FFT
  const fullFft = fft2(a)
  const fullData = fullFft.getData()

  // Return only positive frequencies in last dimension
  const resultCols = cols / 2 + 1
  const result = createTypedArray(rows * resultCols * 2, 'float64')

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < resultCols; j++) {
      result[i * resultCols * 2 + j * 2] = fullData.buffer[i * cols * 2 + j * 2]
      result[i * resultCols * 2 + j * 2 + 1] = fullData.buffer[i * cols * 2 + j * 2 + 1]
    }
  }

  return new NDArrayImpl({
    buffer: result,
    shape: [rows, resultCols, 2],
    strides: [resultCols * 2, 2, 1],
    dtype: 'float64',
  })
}

/**
 * 2D Inverse Real FFT
 */
export function irfft2<T extends DType>(a: NDArray<T>, shape?: [number, number]): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 3 || data.shape[2] !== 2) {
    throw new Error('irfft2 requires [rows, cols, 2] array (real, imag pairs)')
  }

  const inputRows = data.shape[0]
  const inputCols = data.shape[1]
  const [outputRows, outputCols] = shape ?? [inputRows, (inputCols - 1) * 2]

  // Reconstruct full spectrum
  const fullCols = outputCols
  const fullBuffer = createTypedArray(inputRows * fullCols * 2, 'float64')

  for (let i = 0; i < inputRows; i++) {
    // Copy positive frequencies
    for (let j = 0; j < inputCols; j++) {
      fullBuffer[i * fullCols * 2 + j * 2] = data.buffer[i * inputCols * 2 + j * 2]
      fullBuffer[i * fullCols * 2 + j * 2 + 1] = data.buffer[i * inputCols * 2 + j * 2 + 1]
    }

    // Mirror negative frequencies (conjugate symmetry)
    for (let j = 1; j < inputCols - 1; j++) {
      const idx = fullCols - j
      fullBuffer[i * fullCols * 2 + idx * 2] = data.buffer[i * inputCols * 2 + j * 2]
      fullBuffer[i * fullCols * 2 + idx * 2 + 1] = -data.buffer[i * inputCols * 2 + j * 2 + 1]
    }
  }

  const fullSpectrum = new NDArrayImpl({
    buffer: fullBuffer,
    shape: [inputRows, fullCols, 2],
    strides: [fullCols * 2, 2, 1],
    dtype: 'float64',
  })

  // Inverse 2D FFT
  const result = ifft2(fullSpectrum)
  const resultData = result.getData()

  // Return only real part
  const realResult = createTypedArray(outputRows * outputCols, 'float64')
  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      realResult[i * outputCols + j] = resultData.buffer[i * fullCols * 2 + j * 2]
    }
  }

  return new NDArrayImpl({
    buffer: realResult,
    shape: [outputRows, outputCols],
    strides: [outputCols, 1],
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
