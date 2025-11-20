// Placeholder for functional ops exports
// These will be pure functions for tree-shaking

import type { DType } from '../core/types'
import type { NDArray } from '../ndarray'

// ===== Arithmetic operations (functional) =====
export function add<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return a.add(b as any)
}

export function sub<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return a.sub(b as any)
}

export function mul<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return a.mul(b as any)
}

export function div<T extends DType>(a: NDArray<T>, b: NDArray<T> | number): NDArray<T> {
  return a.div(b as any)
}

export function pow<T extends DType>(a: NDArray<T>, exponent: number): NDArray<T> {
  return a.pow(exponent)
}

// ===== Reduction operations (functional) =====
export function sum(a: NDArray): number {
  return a.sum() as number
}

export function mean(a: NDArray): number {
  return a.mean() as number
}

export function max(a: NDArray): number {
  return a.max() as number
}

export function min(a: NDArray): number {
  return a.min() as number
}

// ===== Shape operations (functional) =====
export function reshape<T extends DType>(a: NDArray<T>, shape: number[]): NDArray<T> {
  return a.reshape(shape)
}

export function transpose<T extends DType>(a: NDArray<T>): NDArray<T> {
  return a.transpose()
}

export function flatten<T extends DType>(a: NDArray<T>): NDArray<T> {
  return a.flatten()
}
