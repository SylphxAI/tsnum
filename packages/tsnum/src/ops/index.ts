// ===== Functional API (Pure Functions) =====

// Arithmetic
export { add, sub, mul, div, pow } from './arithmetic'

// Comparison
export { equal, less, greater, lessEqual, greaterEqual } from './comparison'

// Reductions
export { sum, mean, max, min, std, variance } from './reductions'

// Shape
export { reshape, transpose, flatten } from './shape'

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
} from './math'

// Logical operations
export { all, any, logicalAnd, logicalNot, logicalOr, logicalXor, where } from './logical'

// Sorting
export { argmax, argmin, argsort, sort } from './sorting'

// Array manipulation
export { concat, hstack, repeat, stack, vstack } from './manipulation'

// Statistics
export { corrcoef, cov, histogram, median, percentile, quantile } from './statistics'
