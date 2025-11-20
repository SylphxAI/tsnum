// ===== Random Number Generation =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

// Seedable random number generator (LCG - Linear Congruential Generator)
let seed = Date.now()

/**
 * Set random seed for reproducibility
 */
export function setSeed(newSeed: number): void {
  seed = newSeed
}

/**
 * Get current seed
 */
export function getSeed(): number {
  return seed
}

/**
 * Generate random number [0, 1) using LCG
 */
function rand(): number {
  // LCG parameters (same as glibc)
  const a = 1103515245
  const c = 12345
  const m = 2 ** 31

  seed = (a * seed + c) % m
  return seed / m
}

/**
 * Random values in a given shape, uniformly distributed [0, 1)
 */
export function random(shape: number | number[], dtype: DType = 'float64'): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  for (let i = 0; i < size; i++) {
    buffer[i] = rand()
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random integers from low (inclusive) to high (exclusive)
 */
export function randint(
  low: number,
  high: number,
  shape: number | number[] = 1,
  dtype: DType = 'int32',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  const range = high - low

  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(rand() * range) + low
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from standard normal distribution (mean=0, std=1)
 * Uses Box-Muller transform
 */
export function randn(shape: number | number[], dtype: DType = 'float64'): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  // Box-Muller transform generates pairs of independent normal random variables
  for (let i = 0; i < size; i += 2) {
    const u1 = rand()
    const u2 = rand()

    const r = Math.sqrt(-2 * Math.log(u1))
    const theta = 2 * Math.PI * u2

    buffer[i] = r * Math.cos(theta)
    if (i + 1 < size) {
      buffer[i + 1] = r * Math.sin(theta)
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Randomly shuffle array in-place along first axis
 */
export function shuffle<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length === 1) {
    // Fisher-Yates shuffle for 1D
    const buffer = new Float64Array(data.buffer)
    for (let i = buffer.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[buffer[i], buffer[j]] = [buffer[j], buffer[i]]
    }

    // Convert back to original dtype
    const newBuffer = createTypedArray(buffer.length, data.dtype)
    for (let i = 0; i < buffer.length; i++) {
      newBuffer[i] = buffer[i]
    }

    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  throw new Error('shuffle only supports 1D arrays for now')
}

/**
 * Random choice from array
 */
export function choice<T extends DType>(
  a: NDArray<T>,
  size?: number | number[],
  replace = true,
): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('choice only supports 1D arrays')
  }

  const sizeArray = size === undefined ? [1] : typeof size === 'number' ? [size] : size
  const totalSize = sizeArray.reduce((a, b) => a * b, 1)

  if (!replace && totalSize > data.buffer.length) {
    throw new Error('Cannot sample more elements than available without replacement')
  }

  const newBuffer = createTypedArray(totalSize, data.dtype)

  if (replace) {
    // With replacement
    for (let i = 0; i < totalSize; i++) {
      const idx = Math.floor(rand() * data.buffer.length)
      newBuffer[i] = data.buffer[idx]
    }
  } else {
    // Without replacement (reservoir sampling)
    const indices = Array.from({ length: data.buffer.length }, (_, i) => i)
    for (let i = 0; i < totalSize; i++) {
      const j = i + Math.floor(rand() * (indices.length - i))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
      newBuffer[i] = data.buffer[indices[i]]
    }
  }

  const strides = new Array(sizeArray.length)
  strides[sizeArray.length - 1] = 1
  for (let i = sizeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * sizeArray[i + 1]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: sizeArray,
    strides,
    dtype: data.dtype,
  })
}
