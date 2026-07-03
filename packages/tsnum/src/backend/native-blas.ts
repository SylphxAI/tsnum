// ===== Native BLAS Backend =====
// macOS Accelerate-backed hot kernels for Bun.

import { FFIType, dlopen, ptr } from 'bun:ffi'
import type { NDArrayData } from '../core/types'
import { TypeScriptBackend } from './typescript'

const CBLAS_ROW_MAJOR = 101
const CBLAS_NO_TRANS = 111

const accelerate = dlopen('/System/Library/Frameworks/Accelerate.framework/Accelerate', {
  cblas_dgemm: {
    args: [
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.f64,
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.f64,
      FFIType.ptr,
      FFIType.i32,
    ],
    returns: FFIType.void,
  },
  vDSP_vaddD: {
    args: [
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.u64,
    ],
    returns: FFIType.void,
  },
  vDSP_vsmulD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.u64],
    returns: FFIType.void,
  },
  vDSP_vsaddD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.u64],
    returns: FFIType.void,
  },
})

const scalarBuffer = new Float64Array(1)

/**
 * Native BLAS backend.
 *
 * Only proven native kernels are overridden; the TypeScript backend remains the
 * fallback for operations and dtypes that are not yet native-backed.
 */
export class NativeBLASBackend extends TypeScriptBackend {
  readonly name = 'native-blas' as const
  readonly isReady = true

  add(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (a.dtype !== 'float64' || !(a.buffer instanceof Float64Array)) {
      return super.add(a, b)
    }

    if (typeof b === 'number') {
      const output = new Float64Array(a.buffer.length)
      scalarBuffer[0] = b
      accelerate.symbols.vDSP_vsaddD(
        ptr(a.buffer),
        1,
        ptr(scalarBuffer),
        ptr(output),
        1,
        a.buffer.length,
      )
      return {
        buffer: output,
        shape: a.shape,
        strides: a.strides,
        dtype: 'float64',
      }
    }

    if (b.dtype !== 'float64' || !(b.buffer instanceof Float64Array) || !this.hasSameShape(a, b)) {
      return super.add(a, b)
    }

    const output = new Float64Array(a.buffer.length)
    accelerate.symbols.vDSP_vaddD(
      ptr(a.buffer),
      1,
      ptr(b.buffer),
      1,
      ptr(output),
      1,
      a.buffer.length,
    )
    return {
      buffer: output,
      shape: a.shape,
      strides: a.strides,
      dtype: 'float64',
    }
  }

  mul(a: NDArrayData, b: NDArrayData | number): NDArrayData {
    if (a.dtype !== 'float64' || !(a.buffer instanceof Float64Array)) {
      return super.mul(a, b)
    }

    if (typeof b === 'number') {
      const output = new Float64Array(a.buffer.length)
      scalarBuffer[0] = b
      accelerate.symbols.vDSP_vsmulD(
        ptr(a.buffer),
        1,
        ptr(scalarBuffer),
        ptr(output),
        1,
        a.buffer.length,
      )
      return {
        buffer: output,
        shape: a.shape,
        strides: a.strides,
        dtype: 'float64',
      }
    }

    return super.mul(a, b)
  }

  matmul(a: NDArrayData, b: NDArrayData): NDArrayData {
    if (a.dtype !== 'float64' || b.dtype !== 'float64') {
      return super.matmul(a, b)
    }

    if (!(a.buffer instanceof Float64Array) || !(b.buffer instanceof Float64Array)) {
      return super.matmul(a, b)
    }

    if (a.shape.length !== 2 || b.shape.length !== 2) {
      throw new Error('matmul requires 2D arrays')
    }

    const m = a.shape[0]
    const k = a.shape[1]
    const n = b.shape[1]

    if (k !== b.shape[0]) {
      throw new Error(`Shape mismatch: (${m}, ${k}) and (${b.shape[0]}, ${n})`)
    }

    const output = new Float64Array(m * n)
    accelerate.symbols.cblas_dgemm(
      CBLAS_ROW_MAJOR,
      CBLAS_NO_TRANS,
      CBLAS_NO_TRANS,
      m,
      n,
      k,
      1.0,
      ptr(a.buffer),
      k,
      ptr(b.buffer),
      n,
      0.0,
      ptr(output),
      n,
    )

    return {
      buffer: output,
      shape: [m, n],
      strides: [n, 1],
      dtype: 'float64',
    }
  }

  private hasSameShape(a: NDArrayData, b: NDArrayData): boolean {
    if (a.buffer.length !== b.buffer.length || a.shape.length !== b.shape.length) {
      return false
    }
    for (let i = 0; i < a.shape.length; i++) {
      if (a.shape[i] !== b.shape[i]) return false
    }
    return true
  }
}
