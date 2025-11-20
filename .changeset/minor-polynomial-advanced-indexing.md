---
"tsnum": minor
---

# tsnum - Polynomial and Advanced Indexing

**Complete polynomial fitting and advanced array indexing** - Curve fitting, coordinate manipulation, and flexible indexing!

## New Features

### Polynomial Functions (3 functions)
Essential for curve fitting and data analysis:
- `polyfit(x, y, deg)` - Least squares polynomial fit
- `polyval(p, x)` - Evaluate polynomial at values
- `roots(p)` - Find polynomial roots (up to degree 2)

All polynomial functions:
- Use least squares fitting for optimal approximation
- Support Horner's method for efficient evaluation
- Handle linear and quadratic equations analytically
- Enable regression analysis and curve fitting

### Advanced Indexing (5 functions)
Flexible coordinate and index manipulation:
- `ix_(...arrays)` - Construct open mesh from sequences
- `unravel_index(indices, shape)` - Convert flat to multi-dimensional indices
- `ravel_multi_index(multi_index, shape)` - Convert multi-dimensional to flat indices
- `put(a, indices, values)` - Put values at indices (in-place)
- `putmask(a, mask, values)` - Put values where mask is true (in-place)

All indexing functions:
- Support multi-dimensional coordinate conversion
- Enable flexible array element manipulation
- Handle both single and multiple indices
- Follow NumPy indexing conventions

### Array Creation (2 functions)
Generate arrays from functions and coordinates:
- `fromfunction(fn, shape)` - Construct array by executing function over coordinates
- `indices(dimensions)` - Return arrays of grid indices

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  polyfit, polyval, roots,
  ix_, unravel_index, ravel_multi_index, put, putmask,
  fromfunction, indices,
  array
} from 'tsnum'

// Polynomial Functions

// Fit polynomial to data
const x = array([0, 1, 2, 3, 4])
const y = array([1, 3, 2, 5, 7])
const coeffs = polyfit(x, y, 2) // Fit quadratic: ax^2 + bx + c

// Evaluate polynomial
const xNew = array([0.5, 1.5, 2.5])
const yPred = polyval(coeffs, xNew) // Predict values

// Find roots
const p = array([1, -3, 2]) // x^2 - 3x + 2 = 0
const r = roots(p) // [2, 1]

// Advanced Indexing

// Create open mesh for broadcasting
const a = array([1, 2, 3])
const b = array([10, 20])
const [ai, bi] = ix_(a, b)
// ai: [[1], [2], [3]] - shape (3, 1)
// bi: [[10, 20]] - shape (1, 2)
// Can now broadcast: ai + bi

// Convert between flat and multi-dimensional indices
const coords = unravel_index([5, 13], [4, 4])
// [[1, 1], [3, 1]] - row-col coordinates

const flatIdx = ravel_multi_index([[1, 1], [3, 1]], [4, 4])
// [5, 13] - flat indices

// In-place modification
const arr = array([1, 2, 3, 4, 5])
put(arr, [0, 2, 4], [10, 30, 50])
// arr becomes [10, 2, 30, 4, 50]

const mask = array([1, 0, 1, 0, 1])
putmask(arr, mask, 99)
// arr becomes [99, 2, 99, 4, 99]

// Array Creation from Functions

// Generate array from function
const grid = fromfunction((i, j) => i + j, [3, 3])
// [[0, 1, 2],
//  [1, 2, 3],
//  [2, 3, 4]]

// Get coordinate arrays
const [rows, cols] = indices([2, 3])
// rows: [[0, 0, 0],
//        [1, 1, 1]]
// cols: [[0, 1, 2],
//        [0, 1, 2]]
```

## Applications

**Polynomial:**
- Curve fitting and regression
- Data interpolation
- Root finding for equations
- Trend analysis

**Advanced Indexing:**
- Coordinate system transformations
- Multi-dimensional array indexing
- Selective array updates
- Grid construction for computations

**Array Creation:**
- Generate coordinate grids
- Create arrays from mathematical functions
- Build test data
- Initialize arrays with patterns

No changes needed to existing code!
