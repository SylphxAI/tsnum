// ===== Element Selection Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Extract elements from array where condition is true
 */
export function extract<T extends DType>(condition: NDArray<T>, arr: NDArray<T>): NDArray<T> {
  const condData = condition.getData()
  const arrData = arr.getData()

  if (condData.buffer.length !== arrData.buffer.length) {
    throw new Error('Condition and array must have same size')
  }

  // First pass: count true conditions
  let count = 0
  for (let i = 0; i < condData.buffer.length; i++) {
    if (condData.buffer[i] !== 0) {
      count++
    }
  }

  // Second pass: extract values
  const result = createTypedArray(count, arrData.dtype)
  let idx = 0

  for (let i = 0; i < condData.buffer.length; i++) {
    if (condData.buffer[i] !== 0) {
      result[idx++] = arrData.buffer[i]
    }
  }

  return new NDArray({
    buffer: result,
    shape: [count],
    strides: [1],
    dtype: arrData.dtype,
  })
}

/**
 * Change elements of array based on condition
 * In-place operation
 */
export function place<T extends DType>(
  arr: NDArray<T>,
  mask: NDArray<T>,
  values: number | number[] | NDArray<T>,
): void {
  const arrData = arr.getData()
  const maskData = mask.getData()

  if (arrData.buffer.length !== maskData.buffer.length) {
    throw new Error('Array and mask must have same size')
  }

  let valuesArray: number[]
  if (typeof values === 'number') {
    valuesArray = [values]
  } else if (Array.isArray(values)) {
    valuesArray = values
  } else {
    valuesArray = Array.from(values.getData().buffer)
  }

  let valueIdx = 0

  for (let i = 0; i < arrData.buffer.length; i++) {
    if (maskData.buffer[i] !== 0) {
      arrData.buffer[i] = valuesArray[valueIdx % valuesArray.length]
      valueIdx++
    }
  }
}

/**
 * Return selected slices of array along given axis
 */
export function compress<T extends DType>(
  condition: NDArray<T> | boolean[],
  arr: NDArray<T>,
  axis?: number,
): NDArray<T> {
  const arrData = arr.getData()

  if (axis !== undefined && axis !== 0) {
    throw new Error('compress only supports axis=0 or no axis')
  }

  let condArray: boolean[]
  if (Array.isArray(condition)) {
    condArray = condition
  } else {
    const condData = condition.getData()
    condArray = Array.from(condData.buffer).map((v) => v !== 0)
  }

  if (axis === undefined) {
    // Flatten and compress
    if (condArray.length !== arrData.buffer.length) {
      throw new Error('Condition length must match array size when axis is not specified')
    }

    let count = 0
    for (const cond of condArray) {
      if (cond) count++
    }

    const result = createTypedArray(count, arrData.dtype)
    let idx = 0

    for (let i = 0; i < arrData.buffer.length; i++) {
      if (condArray[i]) {
        result[idx++] = arrData.buffer[i]
      }
    }

    return new NDArray({
      buffer: result,
      shape: [count],
      strides: [1],
      dtype: arrData.dtype,
    })
  }

  // Compress along axis 0
  if (arrData.shape.length === 0) {
    throw new Error('Cannot compress 0-dimensional array along axis')
  }

  const rows = arrData.shape[0]
  if (condArray.length !== rows) {
    throw new Error('Condition length must match array size along axis')
  }

  // Count selected rows
  let count = 0
  for (const cond of condArray) {
    if (cond) count++
  }

  if (arrData.shape.length === 1) {
    // 1D case
    const result = createTypedArray(count, arrData.dtype)
    let idx = 0

    for (let i = 0; i < rows; i++) {
      if (condArray[i]) {
        result[idx++] = arrData.buffer[i]
      }
    }

    return new NDArray({
      buffer: result,
      shape: [count],
      strides: [1],
      dtype: arrData.dtype,
    })
  }

  // Multi-dimensional case
  const rowSize = arrData.buffer.length / rows
  const result = createTypedArray(count * rowSize, arrData.dtype)
  let destIdx = 0

  for (let i = 0; i < rows; i++) {
    if (condArray[i]) {
      for (let j = 0; j < rowSize; j++) {
        result[destIdx++] = arrData.buffer[i * rowSize + j]
      }
    }
  }

  const newShape = [count, ...arrData.shape.slice(1)]

  return new NDArray({
    buffer: result,
    shape: newShape,
    strides: newShape.map((_, i) => newShape.slice(i + 1).reduce((a, b) => a * b, 1)),
    dtype: arrData.dtype,
  })
}

/**
 * Construct array from index array and set of choice arrays
 */
export function choose<T extends DType>(
  indices: NDArray<T>,
  choices: NDArray<T>[],
): NDArray<T> {
  const indData = indices.getData()

  if (choices.length === 0) {
    throw new Error('choices array must not be empty')
  }

  const firstChoice = choices[0].getData()

  // Validate all choices have same shape
  for (const choice of choices) {
    const choiceData = choice.getData()
    if (choiceData.buffer.length !== firstChoice.buffer.length) {
      throw new Error('All choice arrays must have same size')
    }
  }

  const result = createTypedArray(indData.buffer.length, firstChoice.dtype)

  for (let i = 0; i < indData.buffer.length; i++) {
    const idx = Math.floor(indData.buffer[i])

    if (idx < 0 || idx >= choices.length) {
      throw new Error(`Index ${idx} out of bounds for choices with length ${choices.length}`)
    }

    const choiceData = choices[idx].getData()
    result[i] = choiceData.buffer[i % choiceData.buffer.length]
  }

  return new NDArray({
    buffer: result,
    shape: [...indData.shape],
    strides: [...indData.strides],
    dtype: firstChoice.dtype,
  })
}
