// ===== Functional API (Pure Functions) =====

// Arithmetic
export { add, sub, mul, div, pow } from './arithmetic'

// Comparison
export { equal, less, greater, lessEqual, greaterEqual } from './comparison'

// Reductions
export { sum, mean, max, min, std, variance } from './reductions'

// Shape
export { expandDims, flatten, reshape, squeeze, swapaxes, transpose } from './shape'

// Indexing
export { at, slice, take } from './indexing'
export type { SliceRange } from './indexing'

// Math functions
export {
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
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  arctan2,
  mod,
  fmod,
} from './math'

// Logical operations
export { all, any, logicalAnd, logicalNot, logicalOr, logicalXor, where } from './logical'

// Sorting
export { argmax, argmin, argsort, sort } from './sorting'

// Array manipulation
export { concat, hstack, hsplit, repeat, split, stack, tile, vstack, vsplit } from './manipulation'

// Statistics
export {
  corrcoef,
  cov,
  histogram,
  median,
  percentile,
  quantile,
  nanmean,
  nansum,
  nanmin,
  nanmax,
  nanstd,
  nanmedian,
  nanvar,
} from './statistics'

// Set operations
export { intersect1d, isin, setdiff1d, setxor1d, union1d, unique } from './set'

// Cumulative operations
export { cumprod, cumsum, diff, gradient } from './cumulative'

// Validation and comparison
export {
  allclose,
  isclose,
  isfinite,
  isinf,
  isnan,
  nonzero,
  searchsorted,
} from './validation'

// Copy and view operations
export { ascontiguousarray, copy, view } from './copy'
