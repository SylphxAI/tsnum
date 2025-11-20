// ===== Type Testing Utilities =====

import type { DType } from '../core/types'
import type { NDArray } from '../ndarray'

/**
 * Check if input is a scalar value
 */
export function isscalar(val: any): boolean {
  return typeof val === 'number' || typeof val === 'boolean'
}

/**
 * Test if array elements are real numbers (no imaginary part)
 * Since we only support real numbers, always returns true for valid arrays
 */
export function isreal<T extends DType>(arr: NDArray<T>): boolean {
  const data = arr.getData()

  // Check for NaN or Infinity which are not "real" in the mathematical sense
  for (let i = 0; i < data.buffer.length; i++) {
    const val = Number(data.buffer[i])
    if (Number.isNaN(val) || !Number.isFinite(val)) {
      return false
    }
  }

  return true
}

/**
 * Test if array elements are complex numbers
 * Since we don't support complex numbers, always returns false
 */
export function iscomplex<T extends DType>(arr: NDArray<T>): boolean {
  return false
}

/**
 * Check if object is a complex number type
 * Since we don't support complex numbers, always returns false
 */
export function iscomplexobj(obj: any): boolean {
  return false
}

/**
 * Check if array contains any real numbers
 * Returns true if all finite real numbers
 */
export function isrealobj<T extends DType>(arr: NDArray<T>): boolean {
  return isreal(arr)
}
