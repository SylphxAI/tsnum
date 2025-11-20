---
"tsnum": minor
---

# tsnum v1.1 - Critical NumPy Features

**Essential operations** - Most commonly used NumPy functions now available!

## New Features

### Set Operations (6 functions)
- `unique` - Find unique values (sorted)
- `isin` - Test element membership
- `intersect1d` - Set intersection
- `union1d` - Set union
- `setdiff1d` - Set difference
- `setxor1d` - Symmetric difference

### Cumulative Operations (4 functions)
- `cumsum` - Cumulative sum
- `cumprod` - Cumulative product
- `diff` - Discrete differences (with n parameter)
- `gradient` - Numerical gradient

### Validation Functions (7 functions)
- `isnan` - NaN checking
- `isinf` - Infinity checking
- `isfinite` - Finite value checking
- `isclose` - Element-wise tolerance comparison
- `allclose` - Boolean tolerance comparison
- `nonzero` - Non-zero indices
- `searchsorted` - Binary search for insertion

### Shape Operations (3 functions)
- `squeeze` - Remove size-1 dimensions
- `expandDims` - Add new axis
- `swapaxes` - Swap two axes (2D support)

### Array Manipulation (4 functions)
- `split` - Split into sub-arrays
- `hsplit` - Horizontal split
- `vsplit` - Vertical split
- `tile` - Tile/repeat array

### Array Creation (5 functions)
- `zerosLike` - Zeros matching shape
- `onesLike` - Ones matching shape
- `fullLike` - Full matching shape
- `empty` - Empty array (safe initialization)
- `emptyLike` - Empty matching shape

## Breaking Changes

None - pure additions to the API.

## Migration

All new functions are tree-shakeable imports:

```typescript
import { unique, cumsum, isnan, squeeze, tile } from 'tsnum'

// Set operations
const arr = array([1, 2, 2, 3, 3, 3])
const uniq = unique(arr) // [1, 2, 3]

// Cumulative operations
const values = array([1, 2, 3, 4])
const cumulative = cumsum(values) // [1, 3, 6, 10]

// Validation
const data = array([1.0, NaN, 3.0])
const nanMask = isnan(data) // [0, 1, 0]

// Shape manipulation
const reshaped = array([[1], [2], [3]])
const squeezed = squeeze(reshaped) // [1, 2, 3]
```

No changes needed to existing code!
