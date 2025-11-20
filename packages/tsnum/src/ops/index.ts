// ===== Functional API (Pure Functions) =====

// Arithmetic
export { add, sub, mul, div, pow } from './arithmetic'

// Comparison
export { equal, less, greater, lessEqual, greaterEqual, not_equal, array_equal, array_equiv } from './comparison'

// Reductions
export { sum, mean, max, min, std, variance, prod, nanprod, count_nonzero } from './reductions'

// Shape
export { expandDims, flatten, reshape, squeeze, swapaxes, transpose } from './shape'

// Indexing
export { at, slice, take } from './indexing'
export type { SliceRange } from './indexing'

// Advanced indexing
export { ix_, ravel_multi_index, unravel_index, put, putmask } from './advanced-indexing'

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
export {
  concat,
  hstack,
  hsplit,
  repeat,
  split,
  stack,
  tile,
  vstack,
  vsplit,
  flip,
  rot90,
  pad,
  moveaxis,
  deleteArr,
  insert,
  append,
  resize,
  roll,
} from './manipulation'

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
  bincount,
  digitize,
  argwhere,
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

// Broadcasting utilities
export { atleast_1d, atleast_2d, atleast_3d, broadcast_arrays, broadcast_to } from './broadcasting'

// Bitwise operations
export { bitwise_and, bitwise_or, bitwise_xor, bitwise_not, left_shift, right_shift, invert } from './bitwise'

// Element selection
export { extract, place, compress, choose } from './selection'

// Numerical integration
export { trapz, cumtrapz } from './integration'
