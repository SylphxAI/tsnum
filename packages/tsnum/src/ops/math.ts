// ===== Math Functions =====
// Element-wise mathematical operations

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray as NDArrayImpl } from '../ndarray'

/**
 * Element-wise absolute value
 */
export function abs<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.abs(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
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

  return new NDArrayImpl({
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
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.sqrt(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise exponential (e^x)
 */
export function exp<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.exp(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise natural logarithm
 */
export function log<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.log(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise base-10 logarithm
 */
export function log10<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.log10(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise sine
 */
export function sin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.sin(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise cosine
 */
export function cos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.cos(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise tangent
 */
export function tan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.tan(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc sine
 */
export function arcsin<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.asin(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc cosine
 */
export function arccos<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.acos(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise arc tangent
 */
export function arctan<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.atan(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise round to nearest integer
 */
export function round<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.round(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise floor (round down)
 */
export function floor<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.floor(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise ceiling (round up)
 */
export function ceil<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.ceil(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise truncate (round towards zero)
 */
export function trunc<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.trunc(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
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

  return new NDArrayImpl({
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

  return new NDArrayImpl({
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

  return new NDArrayImpl({
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
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.sinh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise hyperbolic cosine
 */
export function cosh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.cosh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise hyperbolic tangent
 */
export function tanh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.tanh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise inverse hyperbolic sine
 */
export function asinh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.asinh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise inverse hyperbolic cosine
 */
export function acosh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.acosh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
}

/**
 * Element-wise inverse hyperbolic tangent
 */
export function atanh<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    newBuffer[i] = Math.atanh(data.buffer[i])
  }

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: data.shape,
    strides: data.strides,
    dtype: data.dtype,
  })
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

  return new NDArrayImpl({
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

  return new NDArrayImpl({
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

  return new NDArrayImpl({
    buffer: newBuffer,
    shape: aData.shape,
    strides: aData.strides,
    dtype: aData.dtype,
  })
}
