// ===== Signal Processing Functions =====

import type { DType } from './core/types'
import { createTypedArray } from './core/utils'
import type { NDArray } from './ndarray'
import { NDArray } from './ndarray'

/**
 * Discrete linear convolution of two 1D sequences
 */
export function convolve<T extends DType>(
  a: NDArray<T>,
  v: NDArray<T>,
  mode: 'full' | 'same' | 'valid' = 'full',
): NDArray<T> {
  const aData = a.getData()
  const vData = v.getData()

  if (aData.shape.length !== 1 || vData.shape.length !== 1) {
    throw new Error('convolve only supports 1D arrays')
  }

  const n = aData.buffer.length
  const m = vData.buffer.length

  let outLength: number
  let startIdx: number

  switch (mode) {
    case 'full':
      outLength = n + m - 1
      startIdx = 0
      break
    case 'same':
      outLength = n
      startIdx = Math.floor(m / 2)
      break
    case 'valid':
      outLength = Math.max(n, m) - Math.min(n, m) + 1
      startIdx = m - 1
      break
    default:
      throw new Error(`Invalid mode: ${mode}`)
  }

  const result = createTypedArray(outLength, aData.dtype)

  // Compute convolution
  for (let i = 0; i < outLength; i++) {
    let sum = 0
    const idx = i + startIdx

    for (let j = 0; j < m; j++) {
      const k = idx - j
      if (k >= 0 && k < n) {
        sum += aData.buffer[k] * vData.buffer[j]
      }
    }

    result[i] = sum
  }

  return new NDArray({
    buffer: result,
    shape: [outLength],
    strides: [1],
    dtype: aData.dtype,
  })
}

/**
 * Cross-correlation of two 1D sequences
 */
export function correlate<T extends DType>(
  a: NDArray<T>,
  v: NDArray<T>,
  mode: 'full' | 'same' | 'valid' = 'full',
): NDArray<T> {
  const aData = a.getData()
  const vData = v.getData()

  if (aData.shape.length !== 1 || vData.shape.length !== 1) {
    throw new Error('correlate only supports 1D arrays')
  }

  const n = aData.buffer.length
  const m = vData.buffer.length

  let outLength: number
  let startIdx: number

  switch (mode) {
    case 'full':
      outLength = n + m - 1
      startIdx = 0
      break
    case 'same':
      outLength = n
      startIdx = Math.floor(m / 2)
      break
    case 'valid':
      outLength = Math.max(n, m) - Math.min(n, m) + 1
      startIdx = m - 1
      break
    default:
      throw new Error(`Invalid mode: ${mode}`)
  }

  const result = createTypedArray(outLength, aData.dtype)

  // Compute correlation (like convolution but without reversing v)
  for (let i = 0; i < outLength; i++) {
    let sum = 0
    const idx = i + startIdx

    for (let j = 0; j < m; j++) {
      const k = idx - (m - 1 - j)
      if (k >= 0 && k < n) {
        sum += aData.buffer[k] * vData.buffer[j]
      }
    }

    result[i] = sum
  }

  return new NDArray({
    buffer: result,
    shape: [outLength],
    strides: [1],
    dtype: aData.dtype,
  })
}
