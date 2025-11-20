import type { ArrayOptions, DType, NDArrayData, TypedArray } from './core/types'
import { inferDType } from './core/types'
import {
  computeSize,
  computeStrides,
  createFilledTypedArray,
  createTypedArray,
  validateShape,
} from './core/utils'
import { NDArray } from './ndarray'

// ===== Array creation from data =====
export function array<T extends DType = DType>(
  data: number | number[] | number[][] | number[][][],
  options?: ArrayOptions,
): NDArray<T> {
  // Infer shape and flatten data
  const { shape, flatData } = inferShapeAndFlatten(data)

  // Infer dtype if not provided
  const dtype = options?.dtype ?? (inferDType(flatData[0]) as T)

  // Create buffer
  const buffer = createTypedArray(flatData.length, dtype)
  for (let i = 0; i < flatData.length; i++) {
    buffer[i] = flatData[i]
  }

  const arrayData: NDArrayData = {
    buffer,
    shape,
    strides: computeStrides(shape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Zero-copy from TypedArray =====
export function asarray<T extends DType = DType>(data: TypedArray, shape?: number[]): NDArray<T> {
  const inferredShape = shape ?? [data.length]
  validateShape(inferredShape)

  if (computeSize(inferredShape) !== data.length) {
    throw new Error(`Shape ${inferredShape} does not match data length ${data.length}`)
  }

  // Infer dtype from TypedArray type
  let dtype: DType = 'float64'
  if (data instanceof Float64Array) dtype = 'float64'
  else if (data instanceof Float32Array) dtype = 'float32'
  else if (data instanceof Int32Array) dtype = 'int32'
  else if (data instanceof Int16Array) dtype = 'int16'
  else if (data instanceof Int8Array) dtype = 'int8'
  else if (data instanceof Uint32Array) dtype = 'uint32'
  else if (data instanceof Uint16Array) dtype = 'uint16'
  else if (data instanceof Uint8Array) dtype = 'uint8'

  const arrayData: NDArrayData = {
    buffer: data,
    shape: inferredShape,
    strides: computeStrides(inferredShape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Zeros =====
export function zeros<T extends DType = 'float64'>(
  shape: number[],
  options?: ArrayOptions,
): NDArray<T> {
  validateShape(shape)
  const size = computeSize(shape)
  const dtype = (options?.dtype ?? 'float64') as T
  const buffer = createFilledTypedArray(size, dtype, 0)

  const arrayData: NDArrayData = {
    buffer,
    shape,
    strides: computeStrides(shape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Ones =====
export function ones<T extends DType = 'float64'>(
  shape: number[],
  options?: ArrayOptions,
): NDArray<T> {
  validateShape(shape)
  const size = computeSize(shape)
  const dtype = (options?.dtype ?? 'float64') as T
  const buffer = createFilledTypedArray(size, dtype, 1)

  const arrayData: NDArrayData = {
    buffer,
    shape,
    strides: computeStrides(shape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Full =====
export function full<T extends DType = 'float64'>(
  shape: number[],
  fillValue: number,
  options?: ArrayOptions,
): NDArray<T> {
  validateShape(shape)
  const size = computeSize(shape)
  const dtype = (options?.dtype ?? inferDType(fillValue)) as T
  const buffer = createFilledTypedArray(size, dtype, fillValue)

  const arrayData: NDArrayData = {
    buffer,
    shape,
    strides: computeStrides(shape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Eye (identity matrix) =====
export function eye<T extends DType = 'float64'>(n: number, options?: ArrayOptions): NDArray<T> {
  const shape = [n, n]
  const size = n * n
  const dtype = (options?.dtype ?? 'float64') as T
  const buffer = createTypedArray(size, dtype)

  // Fill diagonal with 1s
  for (let i = 0; i < n; i++) {
    buffer[i * n + i] = 1
  }

  const arrayData: NDArrayData = {
    buffer,
    shape,
    strides: computeStrides(shape),
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Arange =====
export function arange<T extends DType = 'int32'>(
  start: number,
  stop?: number,
  step = 1,
  options?: ArrayOptions,
): NDArray<T> {
  // Handle overloads: arange(stop) or arange(start, stop, step)
  let actualStart = start
  let actualStop = stop ?? start

  if (stop === undefined) {
    actualStart = 0
    actualStop = start
  }

  if (step === 0) {
    throw new Error('Step cannot be zero')
  }

  // Calculate size
  const size = Math.ceil((actualStop - actualStart) / step)
  if (size < 0) {
    throw new Error('Invalid range')
  }

  const dtype = (options?.dtype ?? inferDType(actualStart)) as T
  const buffer = createTypedArray(size, dtype)

  for (let i = 0; i < size; i++) {
    buffer[i] = actualStart + i * step
  }

  const arrayData: NDArrayData = {
    buffer,
    shape: [size],
    strides: [1],
    dtype,
  }

  return new NDArray<T>(arrayData)
}

// ===== Linspace =====
export function linspace<T extends DType = 'float64'>(
  start: number,
  stop: number,
  num = 50,
  options?: ArrayOptions,
): NDArray<T> {
  if (num < 0) {
    throw new Error('Number of samples must be non-negative')
  }

  const dtype = (options?.dtype ?? 'float64') as T
  const buffer = createTypedArray(num, dtype)

  if (num === 1) {
    buffer[0] = start
  } else {
    const step = (stop - start) / (num - 1)
    for (let i = 0; i < num; i++) {
      buffer[i] = start + i * step
    }
  }

  const arrayData: NDArrayData = {
    buffer,
    shape: [num],
    strides: [1],
    dtype,
  }

  return new NDArray<T>(arrayData)
}

/**
 * Return a new array of given shape and type, filled with zeros, matching the shape of a given array
 */
export function zerosLike<T extends DType>(a: NDArray, options?: ArrayOptions): NDArray<T> {
  const data = a.getData()
  const dtype = (options?.dtype ?? data.dtype) as T
  return zeros<T>([...data.shape], { dtype })
}

/**
 * Return a new array of given shape and type, filled with ones, matching the shape of a given array
 */
export function onesLike<T extends DType>(a: NDArray, options?: ArrayOptions): NDArray<T> {
  const data = a.getData()
  const dtype = (options?.dtype ?? data.dtype) as T
  return ones<T>([...data.shape], { dtype })
}

/**
 * Return a full array with the same shape and type as a given array
 */
export function fullLike<T extends DType>(
  a: NDArray,
  fillValue: number,
  options?: ArrayOptions,
): NDArray<T> {
  const data = a.getData()
  const dtype = (options?.dtype ?? data.dtype) as T
  return full<T>([...data.shape], fillValue, { dtype })
}

/**
 * Return a new uninitialized array (filled with zeros for safety)
 */
export function empty<T extends DType = 'float64'>(
  shape: number | number[],
  options?: ArrayOptions,
): NDArray<T> {
  // For safety, we initialize to zeros (true "empty" would be uninitialized memory)
  const normalizedShape = typeof shape === 'number' ? [shape] : shape
  return zeros<T>(normalizedShape, options)
}

/**
 * Return a new uninitialized array with the same shape and type as a given array
 */
export function emptyLike<T extends DType>(a: NDArray, options?: ArrayOptions): NDArray<T> {
  const data = a.getData()
  const dtype = (options?.dtype ?? data.dtype) as T
  return empty<T>([...data.shape], { dtype })
}

/**
 * Create a diagonal matrix or extract diagonal from 2D array
 */
export function diag<T extends DType = 'float64'>(
  v: NDArray<T> | number[],
  k = 0,
  options?: ArrayOptions,
): NDArray<T> {
  // Convert array to NDArray if needed
  let vArray: NDArray<T>
  let dtype: T

  if (Array.isArray(v)) {
    vArray = array(v, options) as NDArray<T>
    dtype = (options?.dtype ?? 'float64') as T
  } else {
    vArray = v
    const vData = vArray.getData()
    dtype = (options?.dtype ?? vData.dtype) as T
  }

  const vData = vArray.getData()

  if (vData.shape.length === 1) {
    // Create diagonal matrix from 1D array
    const n = vData.buffer.length
    const size = n + Math.abs(k)
    const totalSize = size * size
    const buffer = createTypedArray(totalSize, dtype)

    // Fill diagonal
    for (let i = 0; i < n; i++) {
      const row = k >= 0 ? i : i - k
      const col = k >= 0 ? i + k : i
      buffer[row * size + col] = vData.buffer[i]
    }

    return new NDArray<T>({
      buffer,
      shape: [size, size],
      strides: computeStrides([size, size]),
      dtype,
    })
  }

  if (vData.shape.length === 2) {
    // Extract diagonal from 2D array
    const [rows, cols] = vData.shape
    const diagLength = Math.min(rows - Math.max(0, -k), cols - Math.max(0, k))

    if (diagLength <= 0) {
      return new NDArray<T>({
        buffer: createTypedArray(0, dtype),
        shape: [0],
        strides: [1],
        dtype,
      })
    }

    const buffer = createTypedArray(diagLength, dtype)

    for (let i = 0; i < diagLength; i++) {
      const row = k >= 0 ? i : i - k
      const col = k >= 0 ? i + k : i
      buffer[i] = vData.buffer[row * cols + col]
    }

    return new NDArray<T>({
      buffer,
      shape: [diagLength],
      strides: [1],
      dtype,
    })
  }

  throw new Error('diag only supports 1D and 2D arrays')
}

/**
 * Create a lower triangular matrix
 */
export function tri<T extends DType = 'float64'>(
  n: number,
  m?: number,
  k = 0,
  options?: ArrayOptions,
): NDArray<T> {
  const cols = m ?? n
  const dtype = (options?.dtype ?? 'float64') as T
  const size = n * cols
  const buffer = createTypedArray(size, dtype)

  // Fill lower triangle
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < cols; j++) {
      if (j <= i + k) {
        buffer[i * cols + j] = 1
      }
    }
  }

  return new NDArray<T>({
    buffer,
    shape: [n, cols],
    strides: computeStrides([n, cols]),
    dtype,
  })
}

/**
 * Create coordinate matrices from coordinate vectors
 */
export function meshgrid<T extends DType = 'float64'>(
  x: NDArray<T>,
  y: NDArray<T>,
): { X: NDArray<T>; Y: NDArray<T> } {
  const xData = x.getData()
  const yData = y.getData()

  if (xData.shape.length !== 1 || yData.shape.length !== 1) {
    throw new Error('meshgrid only supports 1D arrays')
  }

  const nx = xData.buffer.length
  const ny = yData.buffer.length
  const totalSize = ny * nx

  // Create X grid (repeat x across rows)
  const xBuffer = createTypedArray(totalSize, xData.dtype)
  for (let i = 0; i < ny; i++) {
    for (let j = 0; j < nx; j++) {
      xBuffer[i * nx + j] = xData.buffer[j]
    }
  }

  // Create Y grid (repeat y down columns)
  const yBuffer = createTypedArray(totalSize, yData.dtype)
  for (let i = 0; i < ny; i++) {
    for (let j = 0; j < nx; j++) {
      yBuffer[i * nx + j] = yData.buffer[i]
    }
  }

  return {
    X: new NDArray<T>({
      buffer: xBuffer,
      shape: [ny, nx],
      strides: computeStrides([ny, nx]),
      dtype: xData.dtype,
    }),
    Y: new NDArray<T>({
      buffer: yBuffer,
      shape: [ny, nx],
      strides: computeStrides([ny, nx]),
      dtype: yData.dtype,
    }),
  }
}

// ===== Helper functions =====
function inferShapeAndFlatten(data: number | number[] | number[][] | number[][][]): {
  shape: number[]
  flatData: number[]
} {
  if (typeof data === 'number') {
    return { shape: [], flatData: [data] }
  }

  const shape: number[] = []
  let current: any = data

  while (Array.isArray(current)) {
    shape.push(current.length)
    current = current[0]
  }

  const flatData = flattenArray(data)
  return { shape, flatData }
}

function flattenArray(arr: any): number[] {
  const result: number[] = []

  function flatten(item: any) {
    if (Array.isArray(item)) {
      for (const element of item) {
        flatten(element)
      }
    } else {
      result.push(item)
    }
  }

  flatten(arr)
  return result
}
