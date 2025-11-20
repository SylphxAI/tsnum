// ===== Set Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Find unique values in array
 * Returns sorted unique values
 */
export function unique<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Convert to array and sort
  const values = Array.from(data.buffer).sort((a, b) => a - b)

  // Find unique values
  const uniqueValues: number[] = []
  let prev = Number.NaN

  for (const val of values) {
    if (val !== prev) {
      uniqueValues.push(val)
      prev = val
    }
  }

  // Create result array
  const buffer = createTypedArray(uniqueValues.length, data.dtype)
  for (let i = 0; i < uniqueValues.length; i++) {
    buffer[i] = uniqueValues[i]
  }

  return new NDArray({
    buffer,
    shape: [uniqueValues.length],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Test whether each element of a 1-D array is also present in a second array
 */
export function isin<T extends DType>(a: NDArray<T>, testElements: NDArray<T>): NDArray<'int32'> {
  const aData = a.getData()
  const testData = testElements.getData()

  // Create set for O(1) lookup
  const testSet = new Set(testData.buffer)

  // Check membership
  const buffer = new Int32Array(aData.buffer.length)
  for (let i = 0; i < aData.buffer.length; i++) {
    buffer[i] = testSet.has(aData.buffer[i]) ? 1 : 0
  }

  return new NDArray({
    buffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: 'int32',
  })
}

/**
 * Find the intersection of two arrays
 */
export function intersect1d<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  // Create sets
  const setA = new Set(aData.buffer)
  const setB = new Set(bData.buffer)

  // Find intersection
  const intersection: number[] = []
  for (const val of setA) {
    if (setB.has(val)) {
      intersection.push(val)
    }
  }

  // Sort result
  intersection.sort((a, b) => a - b)

  // Create result array
  const buffer = createTypedArray(intersection.length, aData.dtype)
  for (let i = 0; i < intersection.length; i++) {
    buffer[i] = intersection[i]
  }

  return new NDArray({
    buffer,
    shape: [intersection.length],
    strides: [1],
    dtype: aData.dtype,
  })
}

/**
 * Find the union of two arrays
 */
export function union1d<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  // Combine and get unique values
  const combined = new Set([...aData.buffer, ...bData.buffer])
  const union = Array.from(combined).sort((a, b) => a - b)

  // Create result array
  const buffer = createTypedArray(union.length, aData.dtype)
  for (let i = 0; i < union.length; i++) {
    buffer[i] = union[i]
  }

  return new NDArray({
    buffer,
    shape: [union.length],
    strides: [1],
    dtype: aData.dtype,
  })
}

/**
 * Find set difference of two arrays
 */
export function setdiff1d<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  const setA = new Set(aData.buffer)
  const setB = new Set(bData.buffer)

  // Find elements in A but not in B
  const diff: number[] = []
  for (const val of setA) {
    if (!setB.has(val)) {
      diff.push(val)
    }
  }

  // Sort result
  diff.sort((a, b) => a - b)

  // Create result array
  const buffer = createTypedArray(diff.length, aData.dtype)
  for (let i = 0; i < diff.length; i++) {
    buffer[i] = diff[i]
  }

  return new NDArray({
    buffer,
    shape: [diff.length],
    strides: [1],
    dtype: aData.dtype,
  })
}

/**
 * Find set exclusive-or of two arrays
 */
export function setxor1d<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  const setA = new Set(aData.buffer)
  const setB = new Set(bData.buffer)

  // Find symmetric difference
  const xor: number[] = []

  // Elements in A but not B
  for (const val of setA) {
    if (!setB.has(val)) {
      xor.push(val)
    }
  }

  // Elements in B but not A
  for (const val of setB) {
    if (!setA.has(val)) {
      xor.push(val)
    }
  }

  // Sort result
  xor.sort((a, b) => a - b)

  // Create result array
  const buffer = createTypedArray(xor.length, aData.dtype)
  for (let i = 0; i < xor.length; i++) {
    buffer[i] = xor[i]
  }

  return new NDArray({
    buffer,
    shape: [xor.length],
    strides: [1],
    dtype: aData.dtype,
  })
}
