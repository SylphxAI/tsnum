import { getBackend } from '../backend/manager'
import type { DType } from '../core/types'
import { NDArray } from '../ndarray'

// ===== Arithmetic Operations (Pure Functions) =====
// Delegated to backend (WASM or TypeScript)

export function add<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.add(aData, bData))
}

export function sub<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.sub(aData, bData))
}

export function mul<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.mul(aData, bData))
}

export function div<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  const bData = typeof b === 'number' ? b : b.getData()
  return new NDArray(backend.div(aData, bData))
}

export function pow<T extends DType>(a: NDArray<T>, exponent: number): NDArray<T> {
  const backend = getBackend()
  const aData = a.getData()
  return new NDArray(backend.pow(aData, exponent))
}
