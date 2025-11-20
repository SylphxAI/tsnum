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
export { at, slice, take, flatnonzero } from './indexing'
export type { SliceRange } from './indexing'

// Advanced indexing
export { ix_, ravel_multi_index, unravel_index, put, putmask, booleanIndex, integerArrayIndex } from './advanced-indexing'

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
  exp2,
  log2,
  log1p,
  expm1,
} from './math'

// Math convenience functions
export {
  deg2rad,
  rad2deg,
  hypot,
  sinc,
  cbrt,
  square,
  reciprocal,
  gcd,
  lcm,
  heaviside,
  divmod,
} from './math-convenience'

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

// Array assembly
export { block, column_stack, array_split, dstack } from './array-assembly'

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
  average,
  ptp,
  nanpercentile,
  nanquantile,
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
  nan_to_num,
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

// Array information
export { ndim, size, shape, itemsize, nbytes } from './array-info'

// Interpolation
export { interp } from './interpolation'

// Array utilities
export { trim_zeros, ediff1d, around } from './array-utils'

// Type testing
export { isscalar, isreal, iscomplex, iscomplexobj, isrealobj } from './type-testing'

// Complex number operations
export { real, imag, angle, conj, conjugate } from './complex'
