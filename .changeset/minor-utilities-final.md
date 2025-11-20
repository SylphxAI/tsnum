---
"tsnum": minor
---

# tsnum - Array Utilities and Information Functions (Final)

**Complete the library** - Array introspection, interpolation, utilities, and testing functions!

## New Features

### Array Information Utilities (5 functions)
Introspection and metadata functions:
- `ndim(a)` - Return number of array dimensions
- `size(a, axis?)` - Return number of elements (total or along axis)
- `shape(a)` - Return shape as array
- `itemsize(a)` - Return size of one element in bytes
- `nbytes(a)` - Return total bytes consumed by array

All info functions:
- Provide array metadata without copying data
- Support efficient introspection
- Enable memory and shape analysis
- Compatible with all dtypes

### Interpolation (1 function)
Linear interpolation for data analysis:
- `interp(x, xp, fp, left?, right?)` - 1D linear interpolation

Interpolation features:
- Linear interpolation between data points
- Extrapolation control with left/right parameters
- Sorted input handling
- Efficient evaluation

### Array Utilities (3 functions)
Common array manipulation utilities:
- `trim_zeros(arr, trim)` - Trim leading/trailing zeros
- `ediff1d(arr, toEnd?, toBegin?)` - Consecutive differences
- `around(arr, decimals)` - Round to given decimals

### Array Generation (2 functions)
Logarithmic and geometric spacing:
- `logspace(start, stop, num, base)` - Log-spaced values
- `geomspace(start, stop, num)` - Geometrically spaced values

Generation features:
- Log scale for scientific computing
- Geometric progression for exponential data
- Configurable base for logspace
- Consistent with linspace API

### Type Testing Utilities (5 functions)
Type checking and validation:
- `isscalar(val)` - Check if value is scalar
- `isreal(arr)` - Check if array contains real numbers
- `iscomplex(arr)` - Check if array contains complex numbers (always false)
- `iscomplexobj(obj)` - Check if object is complex type (always false)
- `isrealobj(arr)` - Check if array contains real values

Testing features:
- Scalar vs array distinction
- Real number validation (excludes NaN/Infinity)
- Complex number support (placeholder for future)
- Type guard functions

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  ndim, size, shape, itemsize, nbytes,
  interp,
  trim_zeros, ediff1d, around,
  logspace, geomspace,
  isscalar, isreal,
  array
} from 'tsnum'

// Array Information

const arr = array([[1, 2, 3], [4, 5, 6]])

const dims = ndim(arr)        // 2
const total = size(arr)       // 6
const axisSize = size(arr, 0) // 2 (rows)
const arrShape = shape(arr)   // [2, 3]
const bytes = itemsize(arr)   // 8 (float64)
const totalBytes = nbytes(arr) // 48

// Interpolation

// Linear interpolation
const x = array([0, 1, 2, 3, 4])
const y = array([0, 2, 1, 3, 2])

const xNew = array([0.5, 1.5, 2.5, 3.5])
const yInterp = interp(xNew, x, y)
// [1.0, 1.5, 2.0, 2.5] - interpolated values

// Extrapolation control
const yExtrap = interp(array([-1, 5]), x, y, -999, -999)
// [-999, -999] - use custom values outside range

// Array Utilities

// Trim zeros
const withZeros = array([0, 0, 1, 2, 3, 0, 0])
const trimmed = trim_zeros(withZeros) // [1, 2, 3]
const trimFront = trim_zeros(withZeros, 'f') // [1, 2, 3, 0, 0]
const trimBack = trim_zeros(withZeros, 'b')  // [0, 0, 1, 2, 3]

// Consecutive differences (always returns same length)
const data = array([1, 3, 6, 10])
const diffs = ediff1d(data) // [2, 3, 4]
const withEnds = ediff1d(data, 99, -1) // [-1, 2, 3, 4, 99]

// Rounding
const floats = array([1.12345, 2.56789, 3.14159])
const rounded = around(floats, 2) // [1.12, 2.57, 3.14]

// Array Generation

// Logarithmic spacing (base 10)
const logValues = logspace(0, 3, 4)
// [1, 10, 100, 1000] - 10^0 to 10^3

// Custom base
const log2 = logspace(0, 4, 5, 2)
// [1, 2, 4, 8, 16] - powers of 2

// Geometric spacing
const geom = geomspace(1, 1000, 4)
// [1, 10, 100, 1000] - geometric progression

// Negative values (same sign required)
const negGeom = geomspace(-1, -1000, 4)
// [-1, -10, -100, -1000]

// Type Testing

// Scalar check
isscalar(5)           // true
isscalar(array([5]))  // false

// Real number check
isreal(array([1, 2, 3]))      // true
isreal(array([1, NaN, 3]))    // false (NaN not real)
isreal(array([1, Infinity]))  // false (Infinity not real)

// Complex check (future-proofing)
iscomplex(array([1, 2, 3]))   // false (no complex support)
```

## Applications

**Array Information:**
- Memory profiling and optimization
- Shape validation in pipelines
- Dynamic array handling
- Type introspection

**Interpolation:**
- Time series resampling
- Signal reconstruction
- Data smoothing
- Missing value estimation

**Array Utilities:**
- Data cleaning (trim_zeros)
- Signal processing (ediff1d for velocity from position)
- Display formatting (around)
- Numeric precision control

**Array Generation:**
- Logarithmic plots (logspace)
- Exponential growth modeling (geomspace)
- Frequency analysis (log-spaced frequencies)
- Scientific computing scales

**Type Testing:**
- Input validation
- Type guards in pipelines
- Data quality checks
- API boundary validation

This completes the core NumPy feature set for tsnum!
