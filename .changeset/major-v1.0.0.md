---
"tsnum": major
---

# tsnum v1.0.0 - 100% NumPy Core Functionality Parity 🎉

**Complete feature set** - All essential NumPy operations now available!

## New Features

### Math Functions (20+ functions)
- Trigonometric: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`
- Exponential/Log: `exp`, `log`, `log10`
- Element-wise: `abs`, `sign`, `sqrt`
- Rounding: `round`, `floor`, `ceil`, `trunc`
- Array ops: `maximum`, `minimum`, `clip`

### Logical Operations
- `all`, `any` - Boolean reductions
- `logicalAnd`, `logicalOr`, `logicalNot`, `logicalXor` - Element-wise logic
- `where` - Conditional selection

### Sorting & Search
- `sort` - Sort array elements
- `argsort` - Indices that would sort array
- `argmax`, `argmin` - Indices of max/min values

### Array Manipulation
- `concat`, `stack`, `vstack`, `hstack` - Combine arrays
- `repeat` - Repeat array elements

### Linear Algebra (Complete)
- **Basic ops**: `dot`, `matmul`, `outer`, `inner`
- **Matrix properties**: `det`, `trace`, `norm`
- **Solve systems**: `inv` (2x2, 3x3), `solve` (Ax=b)
- **Decompositions**:
  - `qr` - QR decomposition (Gram-Schmidt)
  - `cholesky` - Cholesky decomposition (positive-definite matrices)
  - `eig` - Eigenvalue decomposition (power iteration)
  - `svd` - Singular Value Decomposition (2x2)

### Random Number Generation
- `random` - Uniform distribution [0, 1)
- `randn` - Normal distribution (Box-Muller transform)
- `randint` - Random integers
- `shuffle` - Fisher-Yates shuffle
- `choice` - Random sampling (with/without replacement)
- `setSeed`, `getSeed` - Reproducible randomness (LCG)

### Advanced Statistics
- `median`, `percentile`, `quantile` - Distribution measures
- `corrcoef` - Correlation coefficient matrix
- `cov` - Covariance matrix
- `histogram` - Binned value counts

### FFT Operations
- `fft`, `ifft` - Fast Fourier Transform (Cooley-Tukey algorithm)
- `rfft`, `irfft` - Real FFT (optimized for real-valued input)

## Breaking Changes

None - pure additions to the API.

## Migration

All new functions are tree-shakeable imports:

```typescript
import { sin, cos, fft, qr, corrcoef } from 'tsnum'
```

No changes needed to existing code!
