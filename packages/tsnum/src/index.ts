// ===== tsnum - TypeScript NumPy Alternative (Functional-First) =====

// 1. Creation functions (most common)
export { array, asarray, zeros, ones, full, eye, arange, linspace } from './creation'

// 2. Operations (functional API - primary)
export {
  // Arithmetic
  add,
  sub,
  mul,
  div,
  pow,
  // Comparison
  equal,
  less,
  greater,
  lessEqual,
  greaterEqual,
  // Reductions
  sum,
  mean,
  max,
  min,
  std,
  variance,
  // Shape
  reshape,
  transpose,
  flatten,
  // Indexing
  at,
  slice,
  take,
} from './ops'

// 3. NDArray (data container)
export { NDArray } from './ndarray'

// 4. Types
export type { DType, TypedArray, NDArrayData, ArrayOptions, AxisOptions } from './core/types'
export type { SliceRange } from './ops'

// 5. Utilities
export { pipe, compose, partial } from './functional'
export { computeSize, computeStrides, broadcastShapes, canBroadcast } from './core/utils'

// 6. Backend (WASM-first with TS fallback)
export { getBackend, initWASM, getBackendInfo } from './backend'
export type { Backend, BackendInit } from './backend'
