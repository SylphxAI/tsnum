// ===== tsnum - TypeScript NumPy Alternative (Functional-First) =====

// 1. Creation functions (most common)
export {
  array,
  asarray,
  zeros,
  ones,
  full,
  eye,
  arange,
  linspace,
  logspace,
  geomspace,
  diag,
  diagflat,
  fill_diagonal,
  tri,
  meshgrid,
  fromfunction,
  indices,
  tril,
  triu,
  vander,
  // Like functions
  zerosLike,
  onesLike,
  fullLike,
  empty,
  emptyLike,
} from './creation'

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
  not_equal,
  array_equal,
  array_equiv,
  // Reductions
  sum,
  mean,
  max,
  min,
  std,
  variance,
  prod,
  nanprod,
  count_nonzero,
  // Shape
  reshape,
  transpose,
  flatten,
  squeeze,
  expandDims,
  swapaxes,
  // Indexing
  at,
  slice,
  take,
  flatnonzero,
  put,
  putmask,
  // Advanced indexing
  ix_,
  ravel_multi_index,
  unravel_index,
  booleanIndex,
  integerArrayIndex,
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
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  arctan2,
  mod,
  fmod,
  round,
  floor,
  ceil,
  trunc,
  maximum,
  minimum,
  clip,
  exp2,
  log2,
  log1p,
  expm1,
  // Math convenience
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
  split,
  hsplit,
  vsplit,
  tile,
  flip,
  rot90,
  pad,
  moveaxis,
  deleteArr,
  insert,
  append,
  resize,
  roll,
  // Array assembly
  block,
  column_stack,
  array_split,
  dstack,
  // Statistics
  median,
  percentile,
  quantile,
  corrcoef,
  cov,
  histogram,
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
  // Cumulative
  cumsum,
  cumprod,
  diff,
  gradient,
  // Set operations
  unique,
  isin,
  intersect1d,
  union1d,
  setdiff1d,
  setxor1d,
  // Validation
  isnan,
  isinf,
  isfinite,
  isclose,
  allclose,
  nonzero,
  searchsorted,
  nan_to_num,
  // Copy and view
  copy,
  view,
  ascontiguousarray,
  // Broadcasting
  atleast_1d,
  atleast_2d,
  atleast_3d,
  broadcast_to,
  broadcast_arrays,
  // Bitwise
  bitwise_and,
  bitwise_or,
  bitwise_xor,
  bitwise_not,
  left_shift,
  right_shift,
  invert,
  // Element selection
  extract,
  place,
  compress,
  choose,
  // Integration
  trapz,
  cumtrapz,
  // Array info
  ndim,
  size,
  shape,
  itemsize,
  nbytes,
  // Interpolation
  interp,
  // Array utilities
  trim_zeros,
  ediff1d,
  around,
  // Type testing
  isscalar,
  isreal,
  iscomplex,
  iscomplexobj,
  isrealobj,
  // Complex operations
  real,
  imag,
  angle,
  conj,
  conjugate,
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
  pinv,
  matrix_rank,
  matrix_power,
  lstsq,
  cond,
  slogdet,
  multi_dot,
  vdot,
  kron,
  tensordot,
} from './linalg'

// 2c. Random
export {
  random,
  randint,
  randn,
  shuffle,
  choice,
  setSeed,
  getSeed,
  uniform,
  normal,
  exponential,
  binomial,
  poisson,
  gamma,
  beta,
  chisquare,
  lognormal,
  triangular,
  weibull,
  pareto,
} from './random'

// 2d. FFT
export {
  fft,
  ifft,
  rfft,
  irfft,
  fft2,
  ifft2,
  rfft2,
  irfft2,
  fftn,
  ifftn,
  rfftn,
  irfftn,
  fftfreq,
  rfftfreq,
  fftshift,
  ifftshift,
} from './fft'

// 2e. Polynomial
export { polyfit, polyval, roots, polyder, polyint } from './polynomial'

// 2f. Window functions
export { hamming, hanning, blackman, bartlett, kaiser } from './window'

// 2g. Signal processing
export { convolve, correlate } from './signal'

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
