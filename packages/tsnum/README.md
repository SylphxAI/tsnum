# tsnum

> High-performance TypeScript numerical computing library with pragmatic functional design

A TypeScript library that brings NumPy's powerful array operations to JavaScript/TypeScript with near-native performance through WebAssembly.

## Features

- 🚀 **High Performance** - WASM-accelerated operations with optimized TypeScript fallback
- 🎯 **NumPy-Inspired** - Familiar functional API for array operations (~42% feature parity with NumPy)
- 📦 **Type Safe** - Full TypeScript support with generic types
- 🔢 **Multiple Data Types** - Support for int32, float32, float64, uint8
- 🧮 **Comprehensive** - 251+ functions covering linear algebra, statistics, FFT, and more
- ⚡ **Pragmatic FP** - Immutable external API with optimized internal operations for maximum performance

## Installation

```bash
npm install tsnum
```

## Quick Start

```typescript
import { array, add, dot, fft, mean, matmul } from 'tsnum'

// Create arrays
const a = array([1, 2, 3, 4])
const b = array([5, 6, 7, 8])

// Mathematical operations (functional API)
const sum = add(a, b)  // [6, 8, 10, 12]
const product = dot(a, b)  // 70

// Statistics
const avg = mean(a)  // 2.5

// FFT
const freq = fft(a)

// Linear algebra
const A = array([[1, 2], [3, 4]])
const B = array([[5, 6], [7, 8]])
const C = matmul(A, B)  // Matrix multiplication

// Convenience: .T property for transpose
const AT = A.T  // Transpose of A
```

## Design Philosophy

**Pragmatic Functional Programming + Dual Backend Architecture**

tsnum follows a pragmatic functional approach that balances purity with performance:

- **Immutable External API**: All operations return new arrays, inputs are never modified
- **Optimized Internals**: Hot loops use mutable operations for maximum performance
- **Zero-Copy Operations**: Views (reshape, transpose) share underlying buffers when possible
- **Functional Core**: Pure functions for all computations - same input always produces same output
- **Dual Backend System**: TypeScript (always available) + WASM (automatic acceleration when available)

```typescript
// ✅ Immutable API - inputs never change
const a = array([1, 2, 3])
const b = add(a, 10)  // Returns new array [11, 12, 13]
// a is still [1, 2, 3]

// ✅ Zero-copy views
const reshaped = reshape(a, [3, 1])  // Shares buffer with a
const transposed = A.T  // Shares buffer with A

// ✅ Functional composition
import { pipe, mean, abs, sqrt } from 'tsnum'
const rms = pipe(data, x => mul(x, x), mean, sqrt)
```

## Feature Coverage

**Current Progress: 251 / ~600 NumPy functions (~42% feature parity)**

### Backend Implementation Status

Complete tracking table for all operations with backend implementation status.

**Legend**:
- ✅ Implemented | 🟦 TypeScript Backend | 🟧 WASM Backend | ⬜ Not Implemented

<details>
<summary><b>📊 View Complete Operations Table (251 operations)</b></summary>

#### 1. Arithmetic Operations (8)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `add` | 🟦 | 🟧 | ✅ | Element-wise addition |
| `sub` | 🟦 | 🟧 | ✅ | Element-wise subtraction |
| `mul` | 🟦 | 🟧 | ✅ | Element-wise multiplication |
| `div` | 🟦 | 🟧 | ✅ | Element-wise division |
| `pow` | 🟦 | 🟧 | ✅ | Power operation |
| `mod` | 🟦 | ⬜ | ✅ | Modulo |
| `fmod` | 🟦 | ⬜ | ✅ | Float modulo |
| `divmod` | 🟦 | ⬜ | ✅ | Combined div+mod |

#### 2. Reductions (6)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `sum` | 🟦 | 🟧 | ✅ | Summation |
| `mean` | 🟦 | 🟧 | ✅ | Average |
| `max` | 🟦 | 🟧 | ✅ | Maximum value |
| `min` | 🟦 | 🟧 | ✅ | Minimum value |
| `std` | 🟦 | 🟧 | ✅ | Standard deviation |
| `variance` | 🟦 | 🟧 | ✅ | Variance |

#### 3. Linear Algebra (23)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `matmul` | 🟦 | 🟧 | ✅ | **Matrix multiplication** |
| `dot` | 🟦 | 🟧 | ✅ | **Dot product** |
| `outer` | 🟦 | ⬜ | ✅ | Outer product |
| `inner` | 🟦 | ⬜ | ✅ | Inner product |
| `vdot` | 🟦 | ⬜ | ✅ | Complex conjugate dot |
| `kron` | 🟦 | ⬜ | ✅ | Kronecker product |
| `tensordot` | 🟦 | ⬜ | ✅ | Tensor contraction |
| `multi_dot` | 🟦 | ⬜ | ✅ | Chained dot products |
| `inv` | 🟦 | 🟧 | ✅ | Matrix inverse |
| `pinv` | 🟦 | ⬜ | ✅ | Pseudoinverse |
| `solve` | 🟦 | ⬜ | ✅ | Linear system solver |
| `lstsq` | 🟦 | ⬜ | ✅ | Least squares |
| `det` | 🟦 | 🟧 | ✅ | Determinant |
| `slogdet` | 🟦 | ⬜ | ✅ | Sign and log det |
| `trace` | 🟦 | ⬜ | ✅ | Matrix trace |
| `norm` | 🟦 | ⬜ | ✅ | Vector/matrix norm |
| `qr` | 🟦 | ⬜ | ✅ | QR decomposition |
| `svd` | 🟦 | ⬜ | ✅ | SVD |
| `cholesky` | 🟦 | ⬜ | ✅ | Cholesky decomposition |
| `eig` | 🟦 | ⬜ | ✅ | Eigenvalues |
| `matrix_rank` | 🟦 | ⬜ | ✅ | Matrix rank |
| `matrix_power` | 🟦 | ⬜ | ✅ | Matrix power |
| `cond` | 🟦 | ⬜ | ✅ | Condition number |

#### 4. Math Functions (40)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `sin`, `cos`, `tan` | 🟦 | 🟧 | ✅ | Trigonometric |
| `arcsin`, `arccos`, `arctan`, `arctan2` | 🟦 | ⬜ | ✅ | Inverse trig |
| `sinh`, `cosh`, `tanh` | 🟦 | ⬜ | ✅ | Hyperbolic |
| `asinh`, `acosh`, `atanh` | 🟦 | ⬜ | ✅ | Inverse hyperbolic |
| `exp`, `exp2`, `expm1` | 🟦 | 🟧 | ✅ | Exponential |
| `log`, `log2`, `log10`, `log1p` | 🟦 | 🟧 | ✅ | Logarithmic |
| `sqrt`, `cbrt`, `square` | 🟦 | 🟧 | ✅ | Powers/roots |
| `abs`, `sign` | 🟦 | 🟧 | ✅ | Sign operations |
| `round`, `floor`, `ceil`, `trunc` | 🟦 | ⬜ | ✅ | Rounding |
| `maximum`, `minimum`, `clip` | 🟦 | ⬜ | ✅ | Comparisons |
| `deg2rad`, `rad2deg`, `hypot`, `sinc`, `heaviside`, `gcd`, `lcm`, `reciprocal` | 🟦 | ⬜ | ✅ | Utilities |

#### 5. FFT (16)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `fft`, `ifft` | 🟦 | 🟧 | ✅ | **1D FFT (priority)** |
| `rfft`, `irfft` | 🟦 | ⬜ | ✅ | Real FFT |
| `fft2`, `ifft2` | 🟦 | ⬜ | ✅ | 2D FFT |
| `rfft2`, `irfft2` | 🟦 | ⬜ | ✅ | 2D real FFT |
| `fftn`, `ifftn` | 🟦 | ⬜ | ✅ | N-D FFT |
| `rfftn`, `irfftn` | 🟦 | ⬜ | ✅ | N-D real FFT |
| `fftfreq`, `rfftfreq`, `fftshift`, `ifftshift` | 🟦 | N/A | ✅ | Utilities (no WASM) |

#### 6. Statistics (24)
| Operation | TS | WASM | Tested | Notes |
|-----------|:--:|:----:|:------:|-------|
| `prod`, `median`, `percentile`, `quantile` | 🟦 | ⬜ | ✅ | Basic stats |
| `average`, `ptp` | 🟦 | ⬜ | ✅ | Advanced stats |
| `corrcoef`, `cov` | 🟦 | ⬜ | ✅ | Correlation |
| `histogram`, `bincount`, `digitize` | 🟦 | ⬜ | ✅ | Binning |
| `nan*` functions (11) | 🟦 | ⬜ | ✅ | NaN-aware |
| `argmin`, `argmax`, `argwhere` | 🟦 | ⬜ | ✅ | Indices |

#### 7. Array Creation (26)
| Category | TS | WASM | Tested | Notes |
|----------|:--:|:----:|:------:|-------|
| Basic (9) | 🟦 | N/A | ✅ | array, zeros, ones, etc. |
| Like (4) | 🟦 | N/A | ✅ | zerosLike, onesLike, etc. |
| Special (13) | 🟦 | N/A | ✅ | eye, diag, meshgrid, etc. |

#### 8. Array Manipulation (45)
| Category | TS | WASM | Tested | Notes |
|----------|:--:|:----:|:------:|-------|
| Shape (7) | 🟦 | N/A | ✅ | reshape, transpose, etc. |
| Join/Split (9) | 🟦 | N/A | ✅ | concat, stack, split, etc. |
| Rearrange (5) | 🟦 | N/A | ✅ | flip, rot90, roll, etc. |
| Modify (5) | 🟦 | N/A | ✅ | delete, insert, append, etc. |
| Assembly (2) | 🟦 | N/A | ✅ | block, column_stack |

#### 9. Random (19)
| Category | TS | WASM | Tested | Notes |
|----------|:--:|:----:|:------:|-------|
| Basic (7) | 🟦 | N/A | ✅ | random, randint, randn, etc. |
| Distributions (12) | 🟦 | N/A | ✅ | normal, uniform, gamma, etc. |

#### 10. Other Operations (63)
| Category | Count | TS | WASM | Tested |
|----------|:-----:|:--:|:----:|:------:|
| Logical | 12 | 🟦 | N/A | ✅ |
| Comparison | 7 | 🟦 | N/A | ✅ |
| Set | 6 | 🟦 | N/A | ✅ |
| Sorting | 5 | 🟦 | N/A | ✅ |
| Bitwise | 8 | 🟦 | N/A | ✅ |
| Indexing | 16 | 🟦 | N/A | ✅ |
| Validation | 10 | 🟦 | N/A | ✅ |
| Array Info | 5 | 🟦 | N/A | ✅ |
| Complex | 5 | 🟦 | N/A | ✅ |
| Other | 9+ | 🟦 | N/A | ✅ |

</details>

### Summary Statistics

| Category | Total | Implemented | TS Backend | WASM Backend | Tested |
|----------|:-----:|:-----------:|:----------:|:------------:|:------:|
| **Core Ops** | 251 | 251 ✅ | 251 🟦 | 26 🟧 | 251 ✅ |
| **WASM Coverage** | 26/251 | **10.4%** | - | - | - |
| **Test Coverage** | 415 tests | **100%** | - | - | - |

### WASM Implementation Priority

**🎯 Next Priority** (Expected Performance Gains):
1. **FFT Operations** (fft, ifft) - 5-20x speedup
2. **Math Functions** (sin, cos, exp, log) - 2-5x speedup (SIMD)
3. **Linear Algebra** (inv, solve, qr) - 10-30x speedup

**✅ Dual Backend** (26 operations):
- Arithmetic: add, sub, mul, div, pow (5)
- Reductions: sum, mean, max, min, std, variance (6)
- Linear Algebra: matmul, dot, inv, det, transpose (5)
- FFT: fft, ifft (2)
- Math: abs, sqrt, exp, log, log10, sin, cos, tan (8)

### ✅ Implemented Functions (251)

#### Array Creation (28 functions)
- **Basic**: `array`, `zeros`, `ones`, `full`, `empty`, `arange`, `linspace`, `logspace`, `geomspace`
- **Like functions**: `zerosLike`, `onesLike`, `fullLike`, `emptyLike`
- **Special**: `eye`, `diag`, `diagflat`, `tri`, `tril`, `triu`, `meshgrid`, `fromfunction`, `indices`, `vander`
- **Copy**: `asarray`, `copy`

#### Array Manipulation (45 functions)
- **Shape**: `reshape`, `flatten`, `squeeze`, `expandDims`, `transpose`, `swapaxes`, `moveaxis`
- **Join/Split**: `concat`, `stack`, `vstack`, `hstack`, `dstack`, `split`, `hsplit`, `vsplit`, `array_split`
- **Rearrange**: `flip`, `rot90`, `roll`, `repeat`, `tile`
- **Modify**: `deleteArr`, `insert`, `append`, `resize`, `pad`
- **Assembly**: `block`, `column_stack`

#### Mathematical Functions (35 functions)
- **Arithmetic**: `add`, `sub`, `mul`, `div`, `pow`, `mod`, `fmod`, `divmod`
- **Trigonometric**: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`, `arctan2`
- **Hyperbolic**: `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`
- **Exponential**: `exp`, `exp2`, `log`, `log2`, `log10`, `log1p`, `expm1`
- **Rounding**: `round`, `floor`, `ceil`, `trunc`
- **Other**: `abs`, `sign`, `sqrt`, `cbrt`, `square`, `reciprocal`, `clip`, `maximum`, `minimum`

#### Math Convenience (11 functions)
- **Angles**: `deg2rad`, `rad2deg`
- **Distance**: `hypot`
- **Special**: `sinc`, `heaviside`
- **Number theory**: `gcd`, `lcm`

#### Linear Algebra (21 functions)
- **Products**: `dot`, `matmul`, `vdot`, `outer`, `inner`, `kron`, `tensordot`, `multi_dot`
- **Decompositions**: `qr`, `svd`, `cholesky`, `eig`
- **Matrix operations**: `inv`, `pinv`, `solve`, `lstsq`, `det`, `slogdet`, `trace`, `norm`
- **Properties**: `matrix_rank`, `matrix_power`, `cond`

#### FFT (16 functions)
- **1D**: `fft`, `ifft`, `rfft`, `irfft`
- **2D**: `fft2`, `ifft2`, `rfft2`, `irfft2`
- **N-D**: `fftn`, `ifftn`, `rfftn`, `irfftn`
- **Utilities**: `fftfreq`, `rfftfreq`, `fftshift`, `ifftshift`

#### Statistics (33 functions)
- **Basic**: `mean`, `median`, `std`, `variance`, `sum`, `prod`, `min`, `max`, `ptp`
- **Advanced**: `average`, `percentile`, `quantile`, `corrcoef`, `cov`, `histogram`, `bincount`
- **NaN-aware**: `nanmean`, `nansum`, `nanmin`, `nanmax`, `nanstd`, `nanmedian`, `nanvar`, `nanpercentile`, `nanquantile`, `nanprod`
- **Search**: `argmin`, `argmax`, `argwhere`, `digitize`

#### Logical Operations (12 functions)
- **Element-wise**: `all`, `any`, `logicalAnd`, `logicalOr`, `logicalNot`, `logicalXor`
- **Comparison**: `equal`, `less`, `greater`, `lessEqual`, `greaterEqual`, `not_equal`

#### Set Operations (6 functions)
`unique`, `isin`, `intersect1d`, `union1d`, `setdiff1d`, `setxor1d`

#### Sorting & Searching (5 functions)
`sort`, `argsort`, `searchsorted`

#### Bitwise Operations (8 functions)
`bitwise_and`, `bitwise_or`, `bitwise_xor`, `bitwise_not`, `left_shift`, `right_shift`, `invert`

#### Indexing & Selection (16 functions)
- **Basic**: `at`, `slice`, `take`, `put`, `putmask`
- **Advanced**: `ix_`, `ravel_multi_index`, `unravel_index`, `flatnonzero`, `booleanIndex`, `integerArrayIndex`
- **Conditional**: `where`, `extract`, `place`, `compress`, `choose`

#### Validation (10 functions)
`isnan`, `isinf`, `isfinite`, `isclose`, `allclose`, `isscalar`, `isreal`, `iscomplex`, `iscomplexobj`, `isrealobj`

#### Array Info (5 functions)
`ndim`, `size`, `shape`, `itemsize`, `nbytes`

#### Complex Numbers (5 functions)
`real`, `imag`, `angle`, `conj`, `conjugate`

#### Polynomial (5 functions)
`polyfit`, `polyval`, `roots`, `polyder`, `polyint`

#### Window Functions (5 functions)
`hamming`, `hanning`, `blackman`, `bartlett`, `kaiser`

#### Signal Processing (2 functions)
`convolve`, `correlate`

#### Random (19 functions)
- **Basic**: `random`, `randint`, `randn`, `choice`, `shuffle`
- **Distributions**: `uniform`, `normal`, `exponential`, `binomial`, `poisson`, `gamma`, `beta`, `chisquare`, `lognormal`, `triangular`, `weibull`, `pareto`
- **Seed**: `setSeed`, `getSeed`

#### Cumulative Operations (4 functions)
`cumsum`, `cumprod`, `diff`, `gradient`

#### Integration (2 functions)
`trapz`, `cumtrapz`

#### Array Utilities (4 functions)
`trim_zeros`, `ediff1d`, `around`, `interp`

#### Broadcasting (5 functions)
`atleast_1d`, `atleast_2d`, `atleast_3d`, `broadcast_to`, `broadcast_arrays`

#### Copy & View (3 functions)
`copy`, `view`, `ascontiguousarray`

#### Fill (2 functions)
`fill_diagonal`, `nan_to_num`

---

### ⏳ Not Yet Implemented (~360 functions, ~59% remaining)

<details>
<summary><b>Click to expand: Missing Features</b></summary>

#### High Priority
- [ ] **I/O Operations**: `save`, `load`, `savez`, `savetxt`, `loadtxt`, `genfromtxt`
- [ ] **String Operations**: Full `numpy.char.*` module (~30 functions)
- [ ] **More Random Distributions**: `chisquare`, `dirichlet`, `f`, `laplace`, `lognormal`, `multinomial`, `multivariate_normal`, etc. (~30 distributions)
- [ ] **Advanced Linear Algebra**: `eigh`, `eigvals`, `svdvals`, `tensorsolve`, `tensorinv`
- [ ] **Array Type Conversion**: `asanyarray`, `asfortranarray`, `asmatrix`, `ravel`

#### Medium Priority
- [ ] **Datetime Operations**: `datetime64`, `timedelta64`, business day functions
- [ ] **Masked Arrays**: `numpy.ma.*` module (~100 functions)
- [ ] **Advanced Polynomial**: Polynomial classes, Chebyshev, Legendre, Laguerre, Hermite
- [ ] **More Statistics**: `histogram2d`, `histogramdd`, `correlate` (cross-correlation), `average` (weighted)
- [ ] **Sorting**: `partition`, `argpartition`, `lexsort`, `msort`, `sort_complex`
- [ ] **Bit Operations**: `packbits`, `unpackbits`

#### Low Priority
- [ ] **Financial Functions**: `fv`, `pv`, `npv`, `pmt`, `irr`, `mirr`, `rate`, etc.
- [ ] **Testing Utilities**: `assert_equal`, `assert_allclose`, etc.
- [ ] **Memory Layout**: `may_share_memory`, `shares_memory`, `byte_bounds`

</details>

---

## Performance

### Dual Backend Architecture

tsnum implements a sophisticated dual backend system for optimal performance:

```typescript
User Code → NDArray API → Backend Interface → WASM (fast) or TypeScript (fallback)
```

**TypeScript Backend**: Always available, pure TS implementation
- Ensures reliability - works everywhere
- Fallback for environments without WASM support
- Reference implementation for correctness

**WASM Backend**: Near-native performance through Rust
- Automatically used when available (no code changes needed)
- Cache-optimized algorithms (matmul uses i-k-j loop order)
- SIMD-ready for future optimization

**Current Backend Coverage**:
- ✅ Arithmetic operations (add, sub, mul, div, pow)
- ✅ Reductions (sum, mean, max, min, std, variance)
- ✅ Linear algebra (matmul, dot)
- 🚧 FFT operations (coming soon)

### Benchmarks

TypeScript Backend (current):
- **matmul 2×2**: ~24 ns/iter
- **matmul 10×10**: ~1.23 µs/iter
- **matmul 100×100**: ~1.15 ms/iter
- **dot 100 elements**: ~39 ns/iter
- **Reshape (zero-copy)**: ~24 ns/iter

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed benchmarks and methodology.

## API Documentation

### Array Creation

```typescript
import { array, zeros, ones, arange, linspace } from 'tsnum'

const a = array([1, 2, 3, 4])
const b = zeros([3, 4])
const c = ones([2, 2], { dtype: 'float64' })
const d = arange(0, 10, 2)  // [0, 2, 4, 6, 8]
const e = linspace(0, 1, 5)  // [0, 0.25, 0.5, 0.75, 1]
```

### Mathematical Operations

```typescript
import { add, mul, sin, exp } from 'tsnum'

const a = array([1, 2, 3])
const b = array([4, 5, 6])

// Element-wise operations
const sum = add(a, b)  // [5, 7, 9]
const product = mul(a, b)  // [4, 10, 18]

// Math functions
const s = sin(a)
const e = exp(a)
```

### Linear Algebra

```typescript
import { matmul, dot, inv, eig, svd } from 'tsnum'

const A = array([[1, 2], [3, 4]])
const B = array([[5, 6], [7, 8]])

// Matrix multiplication
const C = matmul(A, B)

// Matrix inverse
const Ainv = inv(A)

// Eigenvalues and eigenvectors
const { values, vectors } = eig(A)

// SVD
const { U, S, Vt } = svd(A)
```

### Statistics

```typescript
import { mean, std, median, percentile } from 'tsnum'

const data = array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const avg = mean(data)  // 5.5
const stdDev = std(data)  // 2.87...
const med = median(data)  // 5.5
const p90 = percentile(data, 90)  // 9.1
```

### FFT

```typescript
import { fft, ifft, fftfreq, fftshift } from 'tsnum'

const signal = array([1, 2, 3, 4])
const freq = fft(signal)
const original = ifft(freq)

// Frequency bins
const frequencies = fftfreq(signal.getData().shape[0], 1.0)
const centered = fftshift(freq)
```

## TypeScript Support

Full type safety with generics:

```typescript
import { array, NDArray } from 'tsnum'

// Type inference
const a = array([1, 2, 3])  // NDArray<'int32'>
const b = array([1.5, 2.5], { dtype: 'float64' })  // NDArray<'float64'>

// Generic functions
function normalize<T extends DType>(arr: NDArray<T>): NDArray<'float64'> {
  const m = mean(arr)
  const s = std(arr)
  return arr.sub(m).div(s)
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
bun test

# Build
npm run build

# Benchmarks
bun bench
```

## Testing

357 tests covering all implemented features:

```bash
bun test

# Output:
# ✓ 357 pass
# ✓ 0 fail
# ✓ 779 expect() calls
```

## License

MIT

## Contributing

Contributions welcome! See the feature coverage above for areas that need implementation.

## Acknowledgments

- Inspired by [NumPy](https://numpy.org/)
- WASM acceleration powered by custom implementations
- Built with TypeScript and Bun
