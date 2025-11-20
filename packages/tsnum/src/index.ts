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
  // Math
  abs,
  sign,
  sqrt,
  exp,
  log,
  log10,
  sin,
  cos,
  tan,
  arcsin,
  arccos,
  arctan,
  round,
  floor,
  ceil,
  trunc,
  maximum,
  minimum,
  clip,
  // Logical
  all,
  any,
  logicalAnd,
  logicalOr,
  logicalNot,
  logicalXor,
  where,
  // Sorting
  sort,
  argsort,
  argmax,
  argmin,
  // Manipulation
  concat,
  stack,
  vstack,
  hstack,
  repeat,
  // Statistics
  median,
  percentile,
  quantile,
  corrcoef,
  cov,
  histogram,
} from './ops'

// 2b. Linear Algebra
export {
  dot,
  matmul,
  outer,
  inner,
  norm,
  det,
  trace,
  qr,
  cholesky,
  eig,
  svd,
  inv,
  solve,
} from './linalg'

// 2c. Random
export { random, randint, randn, shuffle, choice, setSeed, getSeed } from './random'

// 2d. FFT
export { fft, ifft, rfft, irfft } from './fft'

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
