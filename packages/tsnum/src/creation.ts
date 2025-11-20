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
