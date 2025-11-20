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
