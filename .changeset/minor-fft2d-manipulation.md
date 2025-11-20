---
"tsnum": minor
---

# tsnum - 2D FFT and Array Manipulation

**Image processing and array transformations** - 2D FFT and manipulation operations!

## New Features

### 2D FFT Operations (4 functions)
Essential for image and signal processing:
- `fft2(a)` - 2D Fast Fourier Transform
- `ifft2(a)` - 2D Inverse FFT
- `rfft2(a)` - 2D Real FFT (optimized for real input)
- `irfft2(a, shape)` - 2D Inverse Real FFT

All 2D FFT functions:
- Apply FFT along both axes (row-wise then column-wise)
- Support power-of-2 dimensions
- Return complex results as [rows, cols, 2] arrays
- Efficient Cooley-Tukey algorithm

### Array Manipulation (4 functions)
Common array transformation operations:
- `flip(a, axis)` - Reverse element order along axis
- `rot90(a, k)` - Rotate 90 degrees (k times)
- `pad(a, padWidth, mode, constantValue)` - Pad array edges
- `moveaxis(a, source, destination)` - Move axis to new position

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  fft2, ifft2, rfft2, irfft2,
  flip, rot90, pad, moveaxis,
  array
} from 'tsnum'

// 2D FFT - Image processing
const image = array([[1, 2, 3, 4],
                     [5, 6, 7, 8],
                     [9, 10, 11, 12],
                     [13, 14, 15, 16]])

// Forward 2D FFT
const freq = fft2(image) // [4, 4, 2] complex spectrum

// Inverse 2D FFT
const reconstructed = ifft2(freq)

// Real FFT (for real-valued images)
const rfreq = rfft2(image) // [4, 3, 2] - only positive frequencies
const back = irfft2(rfreq, [4, 4])

// Array Manipulation

// Flip along axis
const flipped = flip(array([1, 2, 3, 4])) // [4, 3, 2, 1]

const matrix = array([[1, 2], [3, 4]])
const vflip = flip(matrix, 0) // [[3, 4], [1, 2]] - flip rows
const hflip = flip(matrix, 1) // [[2, 1], [4, 3]] - flip cols

// Rotate 90 degrees
const rot = rot90(matrix) // [[2, 4], [1, 3]]
const rot180 = rot90(matrix, 2) // [[4, 3], [2, 1]]
const rotCW = rot90(matrix, -1) // [[3, 1], [4, 2]] - clockwise

// Pad array
const arr = array([1, 2, 3])
const padded = pad(arr, 2) // [0, 0, 1, 2, 3, 0, 0]
const padEdge = pad(arr, [1, 2], 'edge') // [1, 1, 2, 3, 3, 3]

// Move axis (transpose for 2D)
const moved = moveaxis(matrix, 0, 1) // Same as transpose
```

## Applications

**2D FFT:**
- Image filtering and enhancement
- Frequency domain analysis
- Convolution via FFT
- Pattern recognition

**Manipulation:**
- Image augmentation (flip, rotate)
- Boundary handling (pad)
- Dimension reordering (moveaxis)

No changes needed to existing code!
