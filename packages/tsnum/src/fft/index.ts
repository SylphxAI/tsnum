// ===== FFT Operations =====

import { getBackend } from '../backend'
import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Fast Fourier Transform (Cooley-Tukey algorithm)
 * Note: Input size must be power of 2
 */
export function fft<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('fft only supports 1D arrays')
  }

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.fft(data)

  return new NDArray(resultData)
}

/**
 * Inverse Fast Fourier Transform
 */
export function ifft<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  if (data.shape.length !== 2 || data.shape[1] !== 2) {
    throw new Error('ifft requires [n, 2] array (real, imag pairs)')
  }

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.ifft(data)

  return new NDArray(resultData)
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

  return new NDArray({
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

  const fullSpectrum = new NDArray({
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

  return new NDArray({
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

    const rowArray = new NDArray({
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

  return new NDArray({
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

    const rowArray = new NDArray({
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

  return new NDArray({
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

  return new NDArray({
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

  const fullSpectrum = new NDArray({
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

  return new NDArray({
    buffer: realResult,
    shape: [outputRows, outputCols],
    strides: [outputCols, 1],
    dtype: 'float64',
  })
}

// ===== N-Dimensional FFT Operations =====

/**
 * N-dimensional FFT
 * Applies FFT along all axes
 */
export function fftn<T extends DType>(a: NDArray<T>, shape?: number[], axes?: number[]): NDArray<'float64'> {
  const data = a.getData()
  const ndim = data.shape.length

  if (ndim === 0) {
    throw new Error('fftn requires at least 1D array')
  }

  // Default axes: all axes
  const targetAxes = axes ?? Array.from({ length: ndim }, (_, i) => i)

  // Validate axes
  for (const axis of targetAxes) {
    if (axis < 0 || axis >= ndim) {
      throw new Error(`Invalid axis: ${axis}`)
    }
  }

  // Default shape: use input shape
  const targetShape = shape ?? data.shape.slice()

  // Validate shape
  if (targetShape.length !== ndim) {
    throw new Error(`Shape length ${targetShape.length} does not match ndim ${ndim}`)
  }

  // Start with input array
  let result: NDArray<'float64'> = a as any

  // Apply FFT along each axis
  for (const axis of targetAxes) {
    result = fftAlongAxis(result, axis, targetShape[axis])
  }

  return result
}

/**
 * N-dimensional inverse FFT
 */
export function ifftn<T extends DType>(a: NDArray<T>, shape?: number[], axes?: number[]): NDArray<'float64'> {
  const data = a.getData()
  const ndim = data.shape.length

  // For complex arrays, shape has extra dimension for [real, imag]
  const actualNdim = data.shape[ndim - 1] === 2 ? ndim - 1 : ndim

  if (actualNdim === 0) {
    throw new Error('ifftn requires at least 1D array')
  }

  // Default axes: all axes except last (which is [real, imag])
  const targetAxes = axes ?? Array.from({ length: actualNdim }, (_, i) => i)

  // Validate axes
  for (const axis of targetAxes) {
    if (axis < 0 || axis >= actualNdim) {
      throw new Error(`Invalid axis: ${axis}`)
    }
  }

  // Default shape: use input shape (excluding [real, imag] dimension)
  const targetShape = shape ?? data.shape.slice(0, actualNdim)

  // Validate shape
  if (targetShape.length !== actualNdim) {
    throw new Error(`Shape length ${targetShape.length} does not match ndim ${actualNdim}`)
  }

  // Start with input array
  let result: NDArray<'float64'> = a as any

  // Apply IFFT along each axis
  for (const axis of targetAxes) {
    result = ifftAlongAxis(result, axis, targetShape[axis])
  }

  return result
}

/**
 * N-dimensional real FFT
 * Applies real FFT along last axis, regular FFT along others
 */
export function rfftn<T extends DType>(a: NDArray<T>, shape?: number[], axes?: number[]): NDArray<'float64'> {
  const data = a.getData()
  const ndim = data.shape.length

  if (ndim === 0) {
    throw new Error('rfftn requires at least 1D array')
  }

  // Default axes: all axes
  const targetAxes = axes ?? Array.from({ length: ndim }, (_, i) => i)

  // Default shape: use input shape
  const targetShape = shape ?? data.shape.slice()

  // Start with input array
  let result: NDArray<'float64'> = a as any

  // Apply FFT along all axes except last
  for (let i = 0; i < targetAxes.length - 1; i++) {
    const axis = targetAxes[i]
    result = fftAlongAxis(result, axis, targetShape[axis])
  }

  // Apply real FFT along last axis
  const lastAxis = targetAxes[targetAxes.length - 1]
  result = rfftAlongAxis(result, lastAxis, targetShape[lastAxis])

  return result
}

/**
 * N-dimensional inverse real FFT
 */
export function irfftn<T extends DType>(a: NDArray<T>, shape?: number[], axes?: number[]): NDArray<'float64'> {
  const data = a.getData()
  const ndim = data.shape.length

  // For complex arrays, shape has extra dimension for [real, imag]
  const actualNdim = data.shape[ndim - 1] === 2 ? ndim - 1 : ndim

  if (actualNdim === 0) {
    throw new Error('irfftn requires at least 1D array')
  }

  // Default axes: all axes
  const targetAxes = axes ?? Array.from({ length: actualNdim }, (_, i) => i)

  // Default shape: use input shape
  const targetShape = shape ?? data.shape.slice(0, actualNdim)

  // Start with input array
  let result: NDArray<'float64'> = a as any

  // Apply inverse real FFT along last axis
  const lastAxis = targetAxes[targetAxes.length - 1]
  result = irfftAlongAxis(result, lastAxis, targetShape[lastAxis])

  // Apply IFFT along all other axes
  for (let i = 0; i < targetAxes.length - 1; i++) {
    const axis = targetAxes[i]
    result = ifftAlongAxis(result, axis, targetShape[axis])
  }

  return result
}

// ===== Helper Functions =====

function fftAlongAxis<T extends DType>(
  arr: NDArray<T>,
  axis: number,
  targetSize?: number,
): NDArray<'float64'> {
  const data = arr.getData()
  const shape = data.shape
  const ndim = shape.length

  if (axis < 0 || axis >= ndim) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  const axisSize = shape[axis]
  const size = targetSize ?? axisSize

  // For now, only support power of 2
  if (size === 0 || (size & (size - 1)) !== 0) {
    throw new Error(`FFT requires size to be power of 2, got ${size}`)
  }

  // Calculate strides for traversal
  const outerSize = shape.slice(0, axis).reduce((a, b) => a * b, 1)
  const innerSize = shape.slice(axis + 1).reduce((a, b) => a * b, 1)

  // Prepare output shape (add dimension for [real, imag])
  const isComplex = shape[ndim - 1] === 2
  const outShape = isComplex ? [...shape] : [...shape, 2]
  outShape[axis] = size

  const outSize = outShape.reduce((a, b) => a * b, 1)
  const outBuffer = new Float64Array(outSize)

  // Process each 1D slice along the axis
  for (let outer = 0; outer < outerSize; outer++) {
    for (let inner = 0; inner < innerSize; inner++) {
      // Extract 1D slice
      const sliceData = new Float64Array(size)
      for (let i = 0; i < Math.min(axisSize, size); i++) {
        const idx = outer * axisSize * innerSize + i * innerSize + inner
        sliceData[i] = data.buffer[idx]
      }

      // Create 1D array and compute FFT
      const slice = new NDArray({
        buffer: sliceData,
        shape: [size],
        strides: [1],
        dtype: data.dtype,
      })
      const sliceFft = fft(slice)
      const sliceFftData = sliceFft.getData()

      // Write result back
      for (let i = 0; i < size; i++) {
        const outIdx = outer * size * innerSize * 2 + i * innerSize * 2 + inner * 2
        outBuffer[outIdx] = sliceFftData.buffer[i * 2]
        outBuffer[outIdx + 1] = sliceFftData.buffer[i * 2 + 1]
      }
    }
  }

  return new NDArray({
    buffer: outBuffer,
    shape: outShape,
    strides: computeStridesForShape(outShape),
    dtype: 'float64',
  })
}

function ifftAlongAxis<T extends DType>(
  arr: NDArray<T>,
  axis: number,
  targetSize?: number,
): NDArray<'float64'> {
  const data = arr.getData()
  const shape = data.shape
  const ndim = shape.length

  if (axis < 0 || axis >= ndim) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  // Array must be complex
  if (shape[ndim - 1] !== 2) {
    throw new Error('ifft requires complex array with shape [..., 2]')
  }

  const axisSize = shape[axis]
  const size = targetSize ?? axisSize

  // For now, only support power of 2
  if (size === 0 || (size & (size - 1)) !== 0) {
    throw new Error(`IFFT requires size to be power of 2, got ${size}`)
  }

  // Calculate strides for traversal
  const actualNdim = ndim - 1 // Exclude [real, imag] dimension
  const outerSize = shape.slice(0, axis).reduce((a, b) => a * b, 1)
  const innerSize = shape.slice(axis + 1, actualNdim).reduce((a, b) => a * b, 1)

  // Prepare output shape
  const outShape = [...shape]
  outShape[axis] = size

  const outSize = outShape.reduce((a, b) => a * b, 1)
  const outBuffer = new Float64Array(outSize)

  // Process each 1D slice along the axis
  for (let outer = 0; outer < outerSize; outer++) {
    for (let inner = 0; inner < innerSize; inner++) {
      // Extract 1D slice (complex)
      const sliceData = new Float64Array(size * 2)
      for (let i = 0; i < Math.min(axisSize, size); i++) {
        const idx = outer * axisSize * innerSize * 2 + i * innerSize * 2 + inner * 2
        sliceData[i * 2] = data.buffer[idx]
        sliceData[i * 2 + 1] = data.buffer[idx + 1]
      }

      // Create 1D complex array and compute IFFT
      const slice = new NDArray({
        buffer: sliceData,
        shape: [size, 2],
        strides: [2, 1],
        dtype: 'float64',
      })
      const sliceIfft = ifft(slice)
      const sliceIfftData = sliceIfft.getData()

      // Write result back
      for (let i = 0; i < size; i++) {
        const outIdx = outer * size * innerSize * 2 + i * innerSize * 2 + inner * 2
        outBuffer[outIdx] = sliceIfftData.buffer[i * 2]
        outBuffer[outIdx + 1] = sliceIfftData.buffer[i * 2 + 1]
      }
    }
  }

  return new NDArray({
    buffer: outBuffer,
    shape: outShape,
    strides: computeStridesForShape(outShape),
    dtype: 'float64',
  })
}

function rfftAlongAxis<T extends DType>(
  arr: NDArray<T>,
  axis: number,
  targetSize?: number,
): NDArray<'float64'> {
  const data = arr.getData()
  const shape = data.shape
  const ndim = shape.length

  if (axis < 0 || axis >= ndim) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  const axisSize = shape[axis]
  const size = targetSize ?? axisSize

  // For now, only support power of 2
  if (size === 0 || (size & (size - 1)) !== 0) {
    throw new Error(`RFFT requires size to be power of 2, got ${size}`)
  }

  // Calculate strides for traversal
  const isComplex = shape[ndim - 1] === 2
  const actualNdim = isComplex ? ndim - 1 : ndim
  const outerSize = shape.slice(0, axis).reduce((a, b) => a * b, 1)
  const innerSize = shape.slice(axis + 1, actualNdim).reduce((a, b) => a * b, 1)

  // Prepare output shape
  const outShape = isComplex ? [...shape] : [...shape, 2]
  outShape[axis] = size / 2 + 1

  const outSize = outShape.reduce((a, b) => a * b, 1)
  const outBuffer = new Float64Array(outSize)

  // Process each 1D slice along the axis
  for (let outer = 0; outer < outerSize; outer++) {
    for (let inner = 0; inner < innerSize; inner++) {
      // Extract 1D slice
      const sliceData = new Float64Array(size)
      for (let i = 0; i < Math.min(axisSize, size); i++) {
        const idx = outer * axisSize * innerSize + i * innerSize + inner
        sliceData[i] = data.buffer[idx]
      }

      // Create 1D array and compute RFFT
      const slice = new NDArray({
        buffer: sliceData,
        shape: [size],
        strides: [1],
        dtype: data.dtype,
      })
      const sliceRfft = rfft(slice)
      const sliceRfftData = sliceRfft.getData()

      // Write result back
      const resultSize = size / 2 + 1
      for (let i = 0; i < resultSize; i++) {
        const outIdx = outer * resultSize * innerSize * 2 + i * innerSize * 2 + inner * 2
        outBuffer[outIdx] = sliceRfftData.buffer[i * 2]
        outBuffer[outIdx + 1] = sliceRfftData.buffer[i * 2 + 1]
      }
    }
  }

  return new NDArray({
    buffer: outBuffer,
    shape: outShape,
    strides: computeStridesForShape(outShape),
    dtype: 'float64',
  })
}

function irfftAlongAxis<T extends DType>(
  arr: NDArray<T>,
  axis: number,
  targetSize?: number,
): NDArray<'float64'> {
  const data = arr.getData()
  const shape = data.shape
  const ndim = shape.length

  if (axis < 0 || axis >= ndim) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  // Array must be complex
  if (shape[ndim - 1] !== 2) {
    throw new Error('irfft requires complex array with shape [..., 2]')
  }

  const axisSize = shape[axis]
  const size = targetSize ?? (axisSize - 1) * 2

  // For now, only support power of 2
  if (size === 0 || (size & (size - 1)) !== 0) {
    throw new Error(`IRFFT requires size to be power of 2, got ${size}`)
  }

  // Calculate strides for traversal
  const actualNdim = ndim - 1 // Exclude [real, imag] dimension
  const outerSize = shape.slice(0, axis).reduce((a, b) => a * b, 1)
  const innerSize = shape.slice(axis + 1, actualNdim).reduce((a, b) => a * b, 1)

  // Prepare output shape (remove [real, imag] dimension)
  const outShape = shape.slice(0, actualNdim)
  outShape[axis] = size

  const outSize = outShape.reduce((a, b) => a * b, 1)
  const outBuffer = new Float64Array(outSize)

  // Process each 1D slice along the axis
  for (let outer = 0; outer < outerSize; outer++) {
    for (let inner = 0; inner < innerSize; inner++) {
      // Extract 1D slice (complex)
      const sliceData = new Float64Array(axisSize * 2)
      for (let i = 0; i < axisSize; i++) {
        const idx = outer * axisSize * innerSize * 2 + i * innerSize * 2 + inner * 2
        sliceData[i * 2] = data.buffer[idx]
        sliceData[i * 2 + 1] = data.buffer[idx + 1]
      }

      // Create 1D complex array and compute IRFFT
      const slice = new NDArray({
        buffer: sliceData,
        shape: [axisSize, 2],
        strides: [2, 1],
        dtype: 'float64',
      })
      const sliceIrfft = irfft(slice, size)
      const sliceIrfftData = sliceIrfft.getData()

      // Write result back
      for (let i = 0; i < size; i++) {
        const outIdx = outer * size * innerSize + i * innerSize + inner
        outBuffer[outIdx] = sliceIrfftData.buffer[i]
      }
    }
  }

  return new NDArray({
    buffer: outBuffer,
    shape: outShape,
    strides: computeStridesForShape(outShape),
    dtype: 'float64',
  })
}

function computeStridesForShape(shape: number[]): number[] {
  const strides: number[] = []
  let stride = 1
  for (let i = shape.length - 1; i >= 0; i--) {
    strides.unshift(stride)
    stride *= shape[i]
  }
  return strides
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

// ===== FFT Utility Functions =====

/**
 * Return the Discrete Fourier Transform sample frequencies
 *
 * @param n Window length (number of samples)
 * @param d Sample spacing (inverse of sampling rate), default 1.0
 * @returns Array of length n containing sample frequencies
 *
 * @example
 * fftfreq(8, 0.125)
 * // [0, 1, 2, 3, -4, -3, -2, -1]
 */
export function fftfreq(n: number, d: number = 1.0): NDArray<'float64'> {
  const freq = createTypedArray(n, 'float64')
  const val = 1.0 / (n * d)

  const halfN = Math.floor((n + 1) / 2)

  // Positive frequencies
  for (let i = 0; i < halfN; i++) {
    freq[i] = i * val
  }

  // Negative frequencies
  for (let i = halfN; i < n; i++) {
    freq[i] = (i - n) * val
  }

  return new NDArray({
    buffer: freq,
    shape: [n],
    strides: [1],
    dtype: 'float64',
  })
}

/**
 * Return the Discrete Fourier Transform sample frequencies for rfft
 * (real FFT - returns only non-negative frequencies)
 *
 * @param n Window length
 * @param d Sample spacing (inverse of sampling rate), default 1.0
 * @returns Array of length n//2 + 1 containing sample frequencies
 *
 * @example
 * rfftfreq(8, 0.125)
 * // [0, 1, 2, 3, 4]
 */
export function rfftfreq(n: number, d: number = 1.0): NDArray<'float64'> {
  const outputLen = Math.floor(n / 2) + 1
  const freq = createTypedArray(outputLen, 'float64')
  const val = 1.0 / (n * d)

  for (let i = 0; i < outputLen; i++) {
    freq[i] = i * val
  }

  return new NDArray({
    buffer: freq,
    shape: [outputLen],
    strides: [1],
    dtype: 'float64',
  })
}

/**
 * Shift zero-frequency component to center of spectrum
 * For 1D or multi-dimensional arrays
 *
 * @param a Input array (typically FFT output)
 * @param axes Axes along which to shift (default: all axes)
 * @returns Shifted array
 *
 * @example
 * const x = fft(signal)
 * const centered = fftshift(x)
 */
export function fftshift<T extends DType>(a: NDArray<T>, axes?: number[]): NDArray<T> {
  const data = a.getData()
  const ndim = data.shape.length

  const targetAxes = axes ?? Array.from({ length: ndim }, (_, i) => i)

  let result = a
  for (const axis of targetAxes) {
    if (axis < 0 || axis >= ndim) {
      throw new Error(`axis ${axis} is out of bounds for array with ${ndim} dimensions`)
    }

    const n = data.shape[axis]
    const shift = Math.floor(n / 2)

    result = rollAxis(result, axis, shift)
  }

  return result
}

/**
 * Inverse of fftshift - shift zero-frequency component back to beginning
 *
 * @param a Input array
 * @param axes Axes along which to shift (default: all axes)
 * @returns Shifted array
 *
 * @example
 * const centered = fftshift(x)
 * const original = ifftshift(centered)
 */
export function ifftshift<T extends DType>(a: NDArray<T>, axes?: number[]): NDArray<T> {
  const data = a.getData()
  const ndim = data.shape.length

  const targetAxes = axes ?? Array.from({ length: ndim }, (_, i) => i)

  let result = a
  for (const axis of targetAxes) {
    if (axis < 0 || axis >= ndim) {
      throw new Error(`axis ${axis} is out of bounds for array with ${ndim} dimensions`)
    }

    const n = data.shape[axis]
    const shift = Math.floor((n + 1) / 2)

    result = rollAxis(result, axis, shift)
  }

  return result
}

/**
 * Helper: Roll array along specific axis
 */
function rollAxis<T extends DType>(a: NDArray<T>, axis: number, shift: number): NDArray<T> {
  const data = a.getData()
  const shape = data.shape.slice()
  const n = shape[axis]

  if (shift === 0 || n === 0) {
    return a
  }

  const normalizedShift = ((shift % n) + n) % n

  const result = createTypedArray(data.buffer.length, data.dtype)

  // Calculate strides for indexing
  const strides = new Array(shape.length)
  strides[shape.length - 1] = 1
  for (let i = shape.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shape[i + 1]
  }

  // Iterate through all elements
  const iterateIndices = (indices: number[], dim: number) => {
    if (dim === shape.length) {
      // Calculate source and destination flat indices
      let srcIdx = 0
      let dstIdx = 0

      for (let i = 0; i < indices.length; i++) {
        if (i === axis) {
          const srcAxisIdx = indices[i]
          const dstAxisIdx = (indices[i] + normalizedShift) % n
          srcIdx += srcAxisIdx * strides[i]
          dstIdx += dstAxisIdx * strides[i]
        } else {
          srcIdx += indices[i] * strides[i]
          dstIdx += indices[i] * strides[i]
        }
      }

      result[dstIdx] = data.buffer[srcIdx]
      return
    }

    for (let i = 0; i < shape[dim]; i++) {
      indices[dim] = i
      iterateIndices(indices, dim + 1)
    }
  }

  iterateIndices(new Array(shape.length).fill(0), 0)

  return new NDArray({
    buffer: result,
    shape: shape,
    strides: strides,
    dtype: data.dtype,
  })
}
