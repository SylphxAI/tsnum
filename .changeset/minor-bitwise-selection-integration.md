---
"tsnum": minor
---

# tsnum - Bitwise Operations, Element Selection, and Integration

**Low-level operations and numerical analysis** - Bit manipulation, conditional selection, and trapezoidal integration!

## New Features

### Bitwise Operations (7 functions)
Low-level bit manipulation operations:
- `bitwise_and(a, b)` - Bitwise AND operation
- `bitwise_or(a, b)` - Bitwise OR operation
- `bitwise_xor(a, b)` - Bitwise XOR operation
- `bitwise_not(a)` - Bitwise NOT (inversion)
- `left_shift(a, shift)` - Shift bits left
- `right_shift(a, shift)` - Shift bits right
- `invert(a)` - Alias for bitwise_not

All bitwise operations:
- Support element-wise operations
- Handle integer arrays
- Support scalar or array shift amounts
- Enable low-level data manipulation

### Enhanced Comparison (3 functions)
Additional comparison and equality testing:
- `not_equal(a, b)` - Element-wise inequality test
- `array_equal(a, b)` - Test if arrays are identical (shape + values)
- `array_equiv(a, b)` - Test if arrays are equivalent (allows type coercion)

All comparison functions:
- Support both array and scalar operands
- Return boolean or uint8 arrays
- Enable array validation and testing
- Follow NumPy comparison semantics

### Element Selection (4 functions)
Conditional element extraction and manipulation:
- `extract(condition, arr)` - Extract elements where condition is true
- `place(arr, mask, values)` - Replace elements where mask is true (in-place)
- `compress(condition, arr, axis)` - Select slices along axis
- `choose(indices, choices)` - Construct array from index and choice arrays

All selection functions:
- Support conditional operations
- Enable flexible array manipulation
- Handle both 1D and multi-dimensional arrays
- Support in-place modifications

### Numerical Integration (2 functions)
Trapezoidal rule integration:
- `trapz(y, x?, dx)` - Definite integral using trapezoidal rule
- `cumtrapz(y, x?, dx, initial)` - Cumulative trapezoidal integration

Integration functions:
- Support uniform or variable spacing
- Handle 1D arrays
- Use composite trapezoidal rule
- Enable numerical analysis

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  bitwise_and, bitwise_or, bitwise_xor, bitwise_not, left_shift, right_shift,
  not_equal, array_equal, array_equiv,
  extract, place, compress, choose,
  trapz, cumtrapz,
  array
} from 'tsnum'

// Bitwise Operations

// Bitwise logic
const a = array([12, 10, 8])  // Binary: 1100, 1010, 1000
const b = array([6, 3, 5])    // Binary: 0110, 0011, 0101

const and = bitwise_and(a, b)  // [4, 2, 0]
const or = bitwise_or(a, b)    // [14, 11, 13]
const xor = bitwise_xor(a, b)  // [10, 9, 13]
const not = bitwise_not(a)     // [-13, -11, -9]

// Bit shifting
const shifted = left_shift(array([1, 2, 4]), 2)  // [4, 8, 16]
const unshifted = right_shift(array([8, 16, 32]), 2)  // [2, 4, 8]

// Enhanced Comparison

// Element-wise inequality
const x = array([1, 2, 3])
const y = array([1, 4, 3])
const neq = not_equal(x, y)  // [0, 1, 0]

// Array equality tests
const eq = array_equal(x, y)     // false
const equiv = array_equiv(x, x)  // true

// Element Selection

// Extract where condition is true
const data = array([1, 2, 3, 4, 5])
const mask = array([1, 0, 1, 0, 1])
const selected = extract(mask, data)  // [1, 3, 5]

// Replace values where mask is true (in-place)
const arr = array([1, 2, 3, 4, 5])
place(arr, mask, 99)  // arr becomes [99, 2, 99, 4, 99]

// Compress along axis
const matrix = array([[1, 2], [3, 4], [5, 6]])
const compressed = compress([true, false, true], matrix, 0)
// [[1, 2], [5, 6]]

// Choose from multiple arrays
const indices = array([0, 1, 0, 1])
const choices = [array([10, 20, 30, 40]), array([100, 200, 300, 400])]
const result = choose(indices, choices)  // [10, 200, 30, 400]

// Numerical Integration

// Definite integral (uniform spacing)
const y1 = array([1, 2, 3, 4, 5])
const area = trapz(y1, undefined, 1.0)  // 12

// Definite integral (variable spacing)
const x = array([0, 1, 3, 6, 10])
const y2 = array([1, 2, 3, 4, 5])
const varArea = trapz(y2, x)  // ~29.5

// Cumulative integration
const cumArea = cumtrapz(y1, undefined, 1.0, 0)
// [0, 1.5, 4, 7.5, 12]
```

## Applications

**Bitwise Operations:**
- Flag manipulation and masking
- Low-level data encoding/decoding
- Efficient set operations
- Hash computations

**Enhanced Comparison:**
- Array validation in tests
- Data consistency checks
- Type-safe comparisons
- Debugging and assertions

**Element Selection:**
- Conditional data filtering
- Masked array operations
- Data cleaning and preprocessing
- Selective updates

**Numerical Integration:**
- Area under curve calculations
- Signal processing
- Physics simulations
- Data analysis and smoothing

No changes needed to existing code!
