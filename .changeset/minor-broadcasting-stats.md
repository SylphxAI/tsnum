---
"tsnum": minor
---

# tsnum - Broadcasting and Statistics Utilities

**NumPy compatibility and data analysis** - Broadcasting utilities and statistical functions!

## New Features

### Broadcasting Utilities (5 functions)
Essential for NumPy compatibility and flexible array operations:
- `atleast_1d(...arrays)` - View arrays with at least 1 dimension
- `atleast_2d(...arrays)` - View arrays with at least 2 dimensions
- `atleast_3d(...arrays)` - View arrays with at least 3 dimensions
- `broadcast_to(array, shape)` - Broadcast array to target shape
- `broadcast_arrays(...arrays)` - Broadcast multiple arrays to common shape

All broadcasting functions:
- Support multiple arrays
- Handle dimension expansion automatically
- Follow NumPy broadcasting rules
- Enable flexible array operations

### Additional Statistics (3 functions)
Common data analysis operations:
- `bincount(x, minlength)` - Count occurrences of integers
- `digitize(x, bins, right)` - Find bin indices for values
- `argwhere(condition)` - Find indices where condition is true

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  atleast_1d, atleast_2d, atleast_3d,
  broadcast_to, broadcast_arrays,
  bincount, digitize, argwhere,
  array
} from 'tsnum'

// Broadcasting Utilities

// Ensure minimum dimensions
const scalar = array([5])
const arr1d = atleast_1d(scalar)[0] // [5]
const arr2d = atleast_2d(scalar)[0] // [[5]]
const arr3d = atleast_3d(scalar)[0] // [[[5]]]

// Broadcast to specific shape
const a = array([1, 2, 3])
const broadcasted = broadcast_to(a, [3, 3])
// [[1, 2, 3],
//  [1, 2, 3],
//  [1, 2, 3]]

// Broadcast multiple arrays to common shape
const x = array([1, 2, 3])
const y = array([[1], [2]])
const [xb, yb] = broadcast_arrays(x, y)
// xb shape: [2, 3]
// yb shape: [2, 3]

// Additional Statistics

// Count occurrences
const data = array([0, 1, 1, 2, 2, 2])
const counts = bincount(data) // [1, 2, 3]

// Digitize - assign to bins
const values = array([0.5, 1.5, 2.5, 3.5])
const bins = array([1, 2, 3])
const indices = digitize(values, bins)
// [0, 1, 2, 3] - which bin each value belongs to

// Find non-zero indices
const mask = array([[0, 1, 0], [1, 0, 1]])
const coords = argwhere(mask)
// [[0, 1], [1, 0], [1, 2]] - coordinates of non-zero elements
```

## Applications

**Broadcasting:**
- Element-wise operations on different shaped arrays
- Vectorized computations
- Memory-efficient array operations
- NumPy compatibility

**Statistics:**
- Frequency analysis (bincount)
- Histogram computation (digitize)
- Conditional indexing (argwhere)
- Data binning and categorization

No changes needed to existing code!
