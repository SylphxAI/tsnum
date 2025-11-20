---
"tsnum": minor
---

# tsnum - Window Functions, Signal Processing, and Advanced Manipulation

**Signal processing and dynamic arrays** - Window functions for DSP, convolution/correlation, and flexible array manipulation!

## New Features

### Window Functions (5 functions)
Standard DSP windowing functions for signal processing:
- `hamming(M)` - Hamming window (weighted cosine)
- `hanning(M)` - Hann window (raised cosine)
- `blackman(M)` - Blackman window (three-term cosine sum)
- `bartlett(M)` - Bartlett window (triangular)
- `kaiser(M, beta)` - Kaiser window (Bessel function)

All window functions:
- Generate tapered windows for FFT/spectral analysis
- Reduce spectral leakage in frequency domain
- Support configurable window lengths
- Use standard DSP window formulas

### Signal Processing (2 functions)
Core signal processing operations:
- `convolve(a, v, mode)` - Discrete linear convolution
- `correlate(a, v, mode)` - Cross-correlation

Signal processing features:
- Support 'full', 'same', 'valid' modes
- Enable filtering and signal analysis
- 1D sequence operations
- Compatible with NumPy modes

### Additional Reductions (3 functions)
More aggregation operations:
- `prod(a)` - Product of all elements
- `nanprod(a)` - Product ignoring NaN values
- `count_nonzero(a)` - Count non-zero elements

### Array Manipulation (5 functions)
Dynamic array modification:
- `deleteArr(arr, indices, axis)` - Delete elements at indices
- `insert(arr, index, values, axis)` - Insert values before index
- `append(arr, values, axis)` - Append values to end
- `resize(arr, newShape)` - Resize array (cycle values if needed)
- `roll(arr, shift, axis)` - Roll elements along axis

All manipulation functions:
- Support negative indices
- Handle both 1D and multi-dimensional arrays
- Enable dynamic array operations
- Support axis-based operations

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  hamming, hanning, blackman, bartlett, kaiser,
  convolve, correlate,
  prod, nanprod, count_nonzero,
  deleteArr, insert, append, resize, roll,
  array
} from 'tsnum'

// Window Functions

// Generate Hamming window for FFT
const window = hamming(64)
// Apply to signal before FFT to reduce spectral leakage
const windowed = signal.mul(window) // element-wise multiplication

// Different window types
const hann = hanning(128)      // Raised cosine
const black = blackman(256)    // Three-term sum
const bart = bartlett(64)      // Triangular
const kais = kaiser(128, 5.0)  // Kaiser (beta controls shape)

// Signal Processing

// Convolution for filtering
const signal = array([1, 2, 3, 4, 5])
const kernel = array([0.25, 0.5, 0.25]) // Moving average filter

const full = convolve(signal, kernel, 'full')
// [0.25, 1, 2, 3, 4, 3.75, 1.25] - full convolution

const same = convolve(signal, kernel, 'same')
// [1, 2, 3, 4, 3.75] - same size as input

const valid = convolve(signal, kernel, 'valid')
// [2, 3, 4] - only where kernel fully overlaps

// Cross-correlation
const corr = correlate(signal, kernel, 'same')
// Measure similarity between signals

// Additional Reductions

// Product of elements
const data = array([2, 3, 4])
const product = prod(data) // 24

// Product ignoring NaN
const withNaN = array([2, NaN, 4])
const nanProduct = nanprod(withNaN) // 8

// Count non-zero elements
const sparse = array([0, 1, 0, 2, 0, 3])
const count = count_nonzero(sparse) // 3

// Array Manipulation

// Delete elements
const arr = array([1, 2, 3, 4, 5])
const deleted = deleteArr(arr, [1, 3]) // [1, 3, 5]

// Insert values
const inserted = insert(arr, 2, [10, 20]) // [1, 2, 10, 20, 3, 4, 5]

// Append values
const appended = append(arr, [6, 7]) // [1, 2, 3, 4, 5, 6, 7]

// Resize array (cycle if needed)
const resized = resize(array([1, 2, 3]), [2, 4])
// [[1, 2, 3, 1],
//  [2, 3, 1, 2]]

// Roll elements
const rolled = roll(array([1, 2, 3, 4, 5]), 2)
// [4, 5, 1, 2, 3] - shifted right by 2
```

## Applications

**Window Functions:**
- FFT preprocessing to reduce spectral leakage
- Digital filter design
- Audio signal processing
- Spectral analysis

**Signal Processing:**
- Digital filtering (low-pass, high-pass, band-pass)
- Feature extraction in audio/image processing
- Pattern matching and detection
- System identification

**Reductions:**
- Statistical analysis
- Data validation (counting non-zero/valid elements)
- Product calculations for probability

**Manipulation:**
- Dynamic array operations
- Data augmentation
- Circular buffers (roll)
- Array editing and modification

No changes needed to existing code!
