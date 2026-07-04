import { getBackend } from '../backend/manager'
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
