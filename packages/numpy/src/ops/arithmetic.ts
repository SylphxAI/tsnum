import { getBackend } from '../backend/manager'
import type { Backend } from '../backend/types'
import type { DType, NDArrayData } from '../core/types'
import { computeStrides } from '../core/utils'
import { NDArray } from '../ndarray'

// ===== Arithmetic Operations (Pure Functions) =====
// Delegated to backend (WASM or TypeScript)

export type ArithmeticOptions<T extends DType = DType> = {
  out?: NDArray<T>
}

export function add<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T> | number,
  options?: ArithmeticOptions<T>,
): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  if (options?.out) {
    const outData = options.out.getData()
    if (writeFastFloat64AddInto(backend, aData, bData, outData)) {
      return options.out
    }

    if (backend.addInto) {
      backend.addInto(aData, bData, outData)
      return options.out
    }

    copyArithmeticResultIntoOut(backend.add(aData, bData), outData)
    return options.out
  }

  return new NDArray(backend.add(aData, bData))
}

export function sub<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.sub(aData, bData))
}

export function subtract<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return sub(a, b)
}

export function mul<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T> | number,
  options?: ArithmeticOptions<T>,
): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  if (options?.out) {
    const outData = options.out.getData()
    if (writeFastFloat64MulInto(backend, aData, bData, outData)) {
      return options.out
    }

    if (backend.mulInto) {
      backend.mulInto(aData, bData, outData)
      return options.out
    }

    copyArithmeticResultIntoOut(backend.mul(aData, bData), outData)
    return options.out
  }

  return new NDArray(backend.mul(aData, bData))
}

export function multiply<T extends DType>(
  a: NDArray<T>,
  b: NDArray<T> | number,
  options?: ArithmeticOptions<T>,
): NDArray<T> {
  return mul(a, b, options)
}

export function div<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.div(aData, bData))
}

export function divide<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return div(a, b)
}

export function pow<T extends DType>(a: NDArray<T>, exponent: number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  return new NDArray(backend.pow(aData, exponent))
}

export function power<T extends DType>(a: NDArray<T>, exponent: number): NDArray<T> {
  return pow(a, exponent)
}

function isContiguous1dFloat64(data: NDArrayData): data is NDArrayData & { buffer: Float64Array } {
  return (
    data.dtype === 'float64' &&
    data.buffer instanceof Float64Array &&
    data.shape.length === 1 &&
    data.strides.length === 1 &&
    data.strides[0] === 1 &&
    data.buffer.length === data.shape[0]
  )
}

function writeFastFloat64AddInto(
  backend: Backend,
  a: NDArrayData,
  b: NDArrayData | number,
  out: NDArrayData,
): boolean {
  if (!isContiguous1dFloat64(a) || !isContiguous1dFloat64(out)) return false
  if (a.buffer.length !== out.buffer.length) return false

  if (typeof b === 'number') {
    if (!backend.addScalarFloat64Into) return false
    backend.addScalarFloat64Into(a.buffer, b, out.buffer)
    return true
  }

  if (!backend.addFloat64Into || !isContiguous1dFloat64(b)) return false
  if (a.buffer.length !== b.buffer.length) return false

  backend.addFloat64Into(a.buffer, b.buffer, out.buffer)
  return true
}

function writeFastFloat64MulInto(
  backend: Backend,
  a: NDArrayData,
  b: NDArrayData | number,
  out: NDArrayData,
): boolean {
  if (typeof b !== 'number') return false
  if (!backend.mulScalarFloat64Into) return false
  if (!isContiguous1dFloat64(a) || !isContiguous1dFloat64(out)) return false
  if (a.buffer.length !== out.buffer.length) return false

  backend.mulScalarFloat64Into(a.buffer, b, out.buffer)
  return true
}

function copyArithmeticResultIntoOut(result: NDArrayData, out: NDArrayData): void {
  if (
    out.shape.length !== result.shape.length ||
    out.shape.some((dimension, index) => dimension !== result.shape[index])
  ) {
    throw new Error(
      `operation out shape mismatch: expected (${result.shape.join(', ')}), got (${out.shape.join(', ')})`,
    )
  }

  if (out.dtype !== result.dtype) {
    throw new Error(`operation out dtype mismatch: expected ${result.dtype}, got ${out.dtype}`)
  }

  if (out.buffer.length !== result.buffer.length) {
    throw new Error(
      `operation out buffer length mismatch: expected ${result.buffer.length}, got ${out.buffer.length}`,
    )
  }

  const expectedStrides = computeStrides(result.shape)
  if (
    out.strides.length !== expectedStrides.length ||
    out.strides.some((stride, index) => stride !== expectedStrides[index])
  ) {
    throw new Error('operation out must be C-contiguous')
  }

  out.buffer.set(result.buffer)
}
