---
"tsnum": minor
---

# tsnum v1.2 - Important NumPy Features

**Extended functionality** - Common scientific computing and data analysis features!

## New Features

### NaN-Aware Statistics (7 functions)
Essential for real-world data with missing values:
- `nanmean` - Mean ignoring NaN
- `nansum` - Sum ignoring NaN
- `nanmin` - Minimum ignoring NaN
- `nanmax` - Maximum ignoring NaN
- `nanstd` - Standard deviation ignoring NaN
- `nanmedian` - Median ignoring NaN
- `nanvar` - Variance ignoring NaN

### Hyperbolic Functions (6 functions)
Common in ML and scientific computing:
- `sinh` - Hyperbolic sine
- `cosh` - Hyperbolic cosine
- `tanh` - Hyperbolic tangent
- `asinh` - Inverse hyperbolic sine
- `acosh` - Inverse hyperbolic cosine
- `atanh` - Inverse hyperbolic tangent

### Additional Math (3 functions)
- `arctan2` - Four-quadrant arc tangent
- `mod` - Modulo operation
- `fmod` - Floating-point modulo

### Matrix Creation (3 functions)
- `diag` - Create diagonal matrix or extract diagonal
- `tri` - Lower triangular matrix
- `meshgrid` - Coordinate matrices from vectors

### Copy Operations (3 functions)
- `copy` - Deep copy of array
- `view` - Shallow copy (shares data)
- `ascontiguousarray` - Ensure contiguous memory layout

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  nanmean, nanstd,
  sinh, tanh,
  diag, meshgrid,
  copy, view
} from 'tsnum'

// NaN-aware statistics
const data = array([1.0, NaN, 3.0, NaN, 5.0])
const avg = nanmean(data) // 3.0 (ignores NaN)
const stdDev = nanstd(data) // 2.0

// Hyperbolic functions (useful in neural networks)
const x = array([0, 1, 2])
const activation = tanh(x) // [0, 0.762, 0.964]

// Create diagonal matrix
const d = diag([1, 2, 3])
// [[1, 0, 0],
//  [0, 2, 0],
//  [0, 0, 3]]

// Meshgrid for plotting/computations
const x = linspace(0, 1, 3)
const y = linspace(0, 1, 2)
const { X, Y } = meshgrid(x, y)

// Copy vs view
const original = array([1, 2, 3])
const deepCopy = copy(original) // independent
const shallowView = view(original) // shares data
```

No changes needed to existing code!
