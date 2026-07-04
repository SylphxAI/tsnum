// ===== Native BLAS Backend =====
// macOS Accelerate-backed hot kernels for Bun.

import { FFIType, dlopen, ptr } from 'bun:ffi'
import type { NDArrayData } from '../core/types'
import { TypeScriptBackend } from './typescript'

declare const Buffer: {
  allocUnsafe(length: number): Uint8Array
  from(buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint8Array
}

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
  vDSP_mtransD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.i32, FFIType.u64, FFIType.u64],
    returns: FFIType.void,
  },
  vDSP_sveD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u64],
    returns: FFIType.void,
  },
  vDSP_meanvD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u64],
    returns: FFIType.void,
  },
})

const scalarBuffer = new Float64Array(1)
const scalarPointer = ptr(scalarBuffer)
const pointerCache = new WeakMap<Float64Array, ReturnType<typeof ptr>>()

type NativeKernelModule = {
  addF64?: (left: Float64Array, right: Float64Array) => Float64Array
  addF64Buffer?: (left: Float64Array, right: Float64Array, output: Uint8Array) => Uint8Array
  addF64Buffers?: (left: Uint8Array, right: Uint8Array, output: Uint8Array) => Uint8Array
  addScalarF64?: (input: Float64Array, scalar: number) => Float64Array
  addScalarF64Buffer?: (input: Float64Array, scalar: number, output: Uint8Array) => Uint8Array
  addScalarF64Buffers?: (input: Uint8Array, scalar: number, output: Uint8Array) => Uint8Array
  mulScalarF64?: (input: Float64Array, scalar: number) => Float64Array
  mulScalarF64Buffers?: (input: Uint8Array, scalar: number, output: Uint8Array) => Uint8Array
}

let nativeKernelModule: NativeKernelModule | null | undefined
const byteViewCache = new WeakMap<Float64Array, Uint8Array>()

function getNativeKernels(): NativeKernelModule | null {
  if (nativeKernelModule !== undefined) {
    return nativeKernelModule
  }

  try {
    nativeKernelModule = require('@sylphx/numpy-native') as NativeKernelModule
  } catch {
    nativeKernelModule = null
  }

  return nativeKernelModule
}

function pointerFor(buffer: Float64Array): ReturnType<typeof ptr> {
  let pointer = pointerCache.get(buffer)
  if (!pointer) {
    pointer = ptr(buffer)
    pointerCache.set(buffer, pointer)
  }
  return pointer
}

function createNativeOutput(length: number): Float64Array {
  const bytes = Buffer.allocUnsafe(length * Float64Array.BYTES_PER_ELEMENT)
  if (bytes.byteOffset % Float64Array.BYTES_PER_ELEMENT !== 0) {
    return new Float64Array(length)
  }
  return new Float64Array(bytes.buffer, bytes.byteOffset, length)
}

function createNativeOutputBuffer(length: number): { array: Float64Array; bytes: Uint8Array } {
  const bytes = Buffer.allocUnsafe(length * Float64Array.BYTES_PER_ELEMENT)
  if (bytes.byteOffset % Float64Array.BYTES_PER_ELEMENT !== 0) {
    const array = new Float64Array(length)
    return { array, bytes: Buffer.from(array.buffer, array.byteOffset, array.byteLength) }
  }
  return { array: new Float64Array(bytes.buffer, bytes.byteOffset, length), bytes }
}

function bytesFor(buffer: Float64Array): Uint8Array {
  let bytes = byteViewCache.get(buffer)
  if (!bytes) {
    bytes = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    byteViewCache.set(buffer, bytes)
  }
  return bytes
}

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
      const native = getNativeKernels()
      if (native?.addScalarF64Buffers) {
        const output = createNativeOutputBuffer(a.buffer.length)
        native.addScalarF64Buffers(bytesFor(a.buffer), b, output.bytes)
        return {
          buffer: output.array,
          shape: a.shape,
          strides: a.strides,
          dtype: 'float64',
        }
      }

      if (native?.addScalarF64Buffer) {
        const output = createNativeOutputBuffer(a.buffer.length)
        native.addScalarF64Buffer(a.buffer, b, output.bytes)
        return {
          buffer: output.array,
          shape: a.shape,
          strides: a.strides,
          dtype: 'float64',
        }
      }

      const output = createNativeOutput(a.buffer.length)
      scalarBuffer[0] = b
      accelerate.symbols.vDSP_vsaddD(
        pointerFor(a.buffer),
        1,
        scalarPointer,
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

    const native = getNativeKernels()
    if (native?.addF64Buffers) {
      const output = createNativeOutputBuffer(a.buffer.length)
      native.addF64Buffers(bytesFor(a.buffer), bytesFor(b.buffer), output.bytes)
      return {
        buffer: output.array,
        shape: a.shape,
        strides: a.strides,
        dtype: 'float64',
      }
    }

    const output = createNativeOutput(a.buffer.length)
    accelerate.symbols.vDSP_vaddD(
      pointerFor(a.buffer),
      1,
      pointerFor(b.buffer),
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
      const native = getNativeKernels()
      if (native?.mulScalarF64Buffers) {
        const output = createNativeOutputBuffer(a.buffer.length)
        native.mulScalarF64Buffers(bytesFor(a.buffer), b, output.bytes)
        return {
          buffer: output.array,
          shape: a.shape,
          strides: a.strides,
          dtype: 'float64',
        }
      }

      const output = createNativeOutput(a.buffer.length)
      scalarBuffer[0] = b
      accelerate.symbols.vDSP_vsmulD(
        pointerFor(a.buffer),
        1,
        scalarPointer,
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

  sum(a: NDArrayData): number {
    if (a.dtype !== 'float64' || !(a.buffer instanceof Float64Array) || a.buffer.length === 0) {
      return super.sum(a)
    }

    accelerate.symbols.vDSP_sveD(pointerFor(a.buffer), 1, scalarPointer, a.buffer.length)
    return scalarBuffer[0]
  }

  mean(a: NDArrayData): number {
    if (a.dtype !== 'float64' || !(a.buffer instanceof Float64Array) || a.buffer.length === 0) {
      return super.mean(a)
    }

    accelerate.symbols.vDSP_meanvD(pointerFor(a.buffer), 1, scalarPointer, a.buffer.length)
    return scalarBuffer[0]
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

    const output = createNativeOutput(m * n)
    accelerate.symbols.cblas_dgemm(
      CBLAS_ROW_MAJOR,
      CBLAS_NO_TRANS,
      CBLAS_NO_TRANS,
      m,
      n,
      k,
      1.0,
      pointerFor(a.buffer),
      k,
      pointerFor(b.buffer),
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

  transpose(a: NDArrayData): NDArrayData {
    if (a.dtype !== 'float64' || !(a.buffer instanceof Float64Array)) {
      return super.transpose(a)
    }

    if (a.shape.length !== 2) {
      throw new Error('transpose requires 2D array')
    }

    const rows = a.shape[0]
    const cols = a.shape[1]
    const output = createNativeOutput(a.buffer.length)

    accelerate.symbols.vDSP_mtransD(pointerFor(a.buffer), 1, ptr(output), 1, cols, rows)

    return {
      buffer: output,
      shape: [cols, rows],
      strides: [rows, 1],
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
