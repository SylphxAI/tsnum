// ===== Math Functions =====
// Element-wise mathematical operations

import { getBackend } from '../backend'
import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Element-wise absolute value
 */
export function abs<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.abs(data)

  return new NDArray(resultData)
}

/**
 * Element-wise sign (-1, 0, or 1)
 */
export function sign<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    newBuffer[i] = val > 0 ? 1 : val < 0 ? -1 : 0
  }

  return new NDArray({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise square root
 */
export function sqrt<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.sqrt(data)

  return new NDArray(resultData)
}

/**
 * Element-wise exponential (e^x)
 */
export function exp<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.exp(data)

  return new NDArray(resultData)
}

/**
 * Element-wise natural logarithm
 */
export function log<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.log(data)

  return new NDArray(resultData)
}

/**
 * Element-wise base-10 logarithm
 */
export function log10<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.log10(data)

  return new NDArray(resultData)
}

/**
 * Element-wise sine
 */
export function sin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.sin(data)

  return new NDArray(resultData)
}

/**
 * Element-wise cosine
 */
export function cos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.cos(data)

  return new NDArray(resultData)
}

/**
 * Element-wise tangent
 */
export function tan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.tan(data)

  return new NDArray(resultData)
}

/**
 * Element-wise arc sine
 */
export function arcsin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.arcsin(data)

  return new NDArray(resultData)
}

/**
 * Element-wise arc cosine
 */
export function arccos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.arccos(data)

  return new NDArray(resultData)
}

/**
 * Element-wise arc tangent
 */
export function arctan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.arctan(data)

  return new NDArray(resultData)
}

/**
 * Element-wise round to nearest integer
 */
export function round<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.round(data)

  return new NDArray(resultData)
}

/**
 * Element-wise floor (round down)
 */
export function floor<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.floor(data)

  return new NDArray(resultData)
}

/**
 * Element-wise ceiling (round up)
 */
export function ceil<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.ceil(data)

  return new NDArray(resultData)
}

/**
 * Element-wise truncate (round towards zero)
 */
export function trunc<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.trunc(data)

  return new NDArray(resultData)
}

/**
 * Element-wise maximum of two arrays
 */
export function maximum<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for maximum')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = Math.max(aData.buffer[i], bData.buffer[i])
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise minimum of two arrays
 */
export function minimum<T extends DType>(a: NDArray<T>, b: NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const bData = b.getData()

  if (aData.buffer.length !== bData.buffer.length) {
    throw new Error('Arrays must have same length for minimum')
  }

  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  for (let i = 0; i < aData.buffer.length; i++) {
    newBuffer[i] = Math.min(aData.buffer[i], bData.buffer[i])
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise clip values to range [min, max]
 */
export function clip<T extends DType>(a: NDArray<T>, min: number, max: number): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    const val = data.buffer[i]
    newBuffer[i] = val < min ? min : val > max ? max : val
  }

  return new NDArray({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

// ===== Hyperbolic Functions =====

/**
 * Element-wise hyperbolic sine
 */
export function sinh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.sinh(data)

  return new NDArray(resultData)
}

/**
 * Element-wise hyperbolic cosine
 */
export function cosh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.cosh(data)

  return new NDArray(resultData)
}

/**
 * Element-wise hyperbolic tangent
 */
export function tanh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.tanh(data)

  return new NDArray(resultData)
}

/**
 * Element-wise inverse hyperbolic sine
 */
export function asinh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.asinh(data)

  return new NDArray(resultData)
}

/**
 * Element-wise inverse hyperbolic cosine
 */
export function acosh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.acosh(data)

  return new NDArray(resultData)
}

/**
 * Element-wise inverse hyperbolic tangent
 */
export function atanh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.atanh(data)

  return new NDArray(resultData)
}

// ===== Additional Math Functions =====

/**
 * Element-wise arc tangent of y/x in radians
 */
export function arctan2<T extends DType>(y: NDArray<T>, x: NDArray<T>): NDArray<T> {
  const yData = y.getData()
  const xData = x.getData()

  if (yData.buffer.length !== xData.buffer.length) {
    throw new Error('Arrays must have same length for arctan2')
  }

  const newBuffer = createTypedArray(yData.buffer.length, yData.dtype)

  for (let i = 0; i < yData.buffer.length; i++) {
    newBuffer[i] = Math.atan2(yData.buffer[i], xData.buffer[i])
  }

  return new NDArray({
    buffer: newBuffer,
    shape: yData.shape,
    strides: yData.strides,
    dtype: yData.dtype,
  })
}

/**
 * Element-wise modulo (remainder after division)
 */
export function mod<T extends DType>(a: NDArray<T>, b: number | NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  if (typeof b === 'number') {
    for (let i = 0; i < aData.buffer.length; i++) {
      newBuffer[i] = aData.buffer[i] % b
    }
  } else {
    const bData = b.getData()
    if (aData.buffer.length !== bData.buffer.length) {
      throw new Error('Arrays must have same length for mod')
    }

    for (let i = 0; i < aData.buffer.length; i++) {
      newBuffer[i] = aData.buffer[i] % bData.buffer[i]
    }
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

/**
 * Element-wise floating-point modulo (IEEE remainder)
 */
export function fmod<T extends DType>(a: NDArray<T>, b: number | NDArray<T>): NDArray<T> {
  const aData = a.getData()
  const newBuffer = createTypedArray(aData.buffer.length, aData.dtype)

  if (typeof b === 'number') {
    for (let i = 0; i < aData.buffer.length; i++) {
      // JavaScript % operator is already fmod for floats
      newBuffer[i] = aData.buffer[i] % b
    }
  } else {
    const bData = b.getData()
    if (aData.buffer.length !== bData.buffer.length) {
      throw new Error('Arrays must have same length for fmod')
    }

    for (let i = 0; i < aData.buffer.length; i++) {
      newBuffer[i] = aData.buffer[i] % bData.buffer[i]
    }
  }

  return new NDArray({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}

// ===== Numerical Stability Math Functions =====

/**
 * Calculate 2**x element-wise
 * More accurate than pow(2, x) for some implementations
 *
 * @param a Input array
 * @returns 2 raised to power of each element
 *
 * @example
 * exp2(array([0, 1, 2, 3])) // [1, 2, 4, 8]
 */
export function exp2<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.exp2(data)

  return new NDArray(resultData)
}

/**
 * Calculate log base 2 element-wise
 *
 * @param a Input array
 * @returns Base-2 logarithm of each element
 *
 * @example
 * log2(array([1, 2, 4, 8])) // [0, 1, 2, 3]
 */
export function log2<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.log2(data)

  return new NDArray(resultData)
}

/**
 * Calculate log(1 + x) element-wise
 * More accurate than log(1 + x) for small x
 *
 * @param a Input array
 * @returns Natural logarithm of (1 + x)
 *
 * @example
 * log1p(array([0, 0.1, 1, 10])) // [0, 0.0953..., 0.693..., 2.397...]
 */
export function log1p<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.log1p(data)

  return new NDArray(resultData)
}

/**
 * Calculate exp(x) - 1 element-wise
 * More accurate than exp(x) - 1 for small x
 *
 * @param a Input array
 * @returns e^x - 1
 *
 * @example
 * expm1(array([0, 0.1, 1])) // [0, 0.1051..., 1.718...]
 */
export function expm1<T extends DType>(a: NDArray<T>): NDArray<'float64'> {
  const data = a.getData()

  // Delegate to backend (WASM if available, TS fallback)
  const backend = getBackend()
  const resultData = backend.expm1(data)

  return new NDArray(resultData)
}
