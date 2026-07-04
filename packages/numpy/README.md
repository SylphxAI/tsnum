# @sylphx/numpy - NumPy for TypeScript

> NumPy-compatible TypeScript numerical engine with a Python parity performance gate

This package is the public NumPy-compatible TypeScript surface. The repository
started as `tsnum`; `@sylphx/numpy` is now the package contract, with `np` as
the canonical import alias.

The product direction is deliberately familiar: make Python-style numerical
computing available in TypeScript with `np` syntax, native-backed hot paths, and
benchmark evidence against Python/NumPy. The package should feel obvious to
Python users, not like a new DSL.

Release gate: `@sylphx/numpy` npm publication must pass
`bun run bench:python-parity:repeatability` and npm registry readback first.
Until that readback exists, treat the install command below as the post-release
package contract rather than current registry availability.

Launch and marketing claims are governed by the repository
[Python parity launch contract](https://github.com/SylphxAI/tsnum/blob/main/docs/adl/0001-python-parity-launch-contract.md).

NumPy is a project of the NumPy community. This package is NumPy-compatible in
API direction and is not affiliated with, endorsed by, or sponsored by NumPy.

## Public Direction

This package is the NumPy migration path for TypeScript: Python
function names, Python-like array semantics, and native-backed performance
where JavaScript hot loops are not enough. Performance claims are admitted by
`bun run bench:python-parity:enforce`; release claims require
`bun run bench:python-parity:repeatability`, which runs the enforced benchmark
repeatedly on the same machine.

Current truth:

- Public API: NumPy-compatible `np` namespace.
- Public package: `@sylphx/numpy`.
- Acceleration: TypeScript fallback plus WASM, Rust/N-API, and native BLAS
  paths.
- Evidence tools: Python parity benchmark plus native dispatch probe for
  kernel/wrapper/public-API timing.
- Recorded benchmark evidence: accepted main CI runs pass checksum parity for
  every covered row and show native-backed speed wins on many covered rows.
  The latest uploaded main `python-parity-report` artifact is canonical when
  this dated snapshot drifts.
- Recorded main snapshot `28701383776`: `add_arrays_1m` (`0.75x`),
  `add_scalar_1m` (`0.59x`), `mean_1m` (`0.57x`), `mul_scalar_1m` (`0.55x`),
  `mul_scalar_1m_out` (`1.04x`), `sum_1m` (`0.57x`), and `transpose_512`
  (`0.72x`) pass the speed target. `add_arrays_1m_out` (`1.25x`),
  `add_scalar_1m_out` (`1.05x`), and `matmul_128` (`1.10x`) miss that
  snapshot's release target. Full speed parity is not claimed.
- Native dispatch evidence: the same run measured `public.addScalar.out` at
  `0.2121ms`, `public.addArrays.out` at `0.4782ms`, `public.mulScalar.out` at
  `0.1846ms`, `public.matmul128` at `0.0843ms`, and `public.matmul128.out` at
  `0.0763ms`, confirming that native output-buffer paths are the right
  direction while the NumPy release threshold still needs to clear repeatably
  for every covered row.
- Release gate evidence: `bench:python-parity:repeatability` and
  `release:preflight` remain admission blockers until every covered speed row
  passes repeatably, so npm publication remains blocked.
- Claim boundary: full NumPy parity is the target, not a completed claim.

## Python-To-TypeScript Contract

```python
# Python
import numpy as np

x = np.arange(1_000_000, dtype=np.float64)
y = np.mean(np.multiply(x, 2.0))
```

```typescript
// TypeScript
import * as np from '@sylphx/numpy'

const x = np.arange(1_000_000, { dtype: 'float64' })
const y = np.mean(np.multiply(x, 2.0))
```

Where TypeScript cannot mirror Python operators, `@sylphx/numpy` uses NumPy
function spelling and Python-style array semantics: `np.matmul`,
`np.multiply`, `np.reshape`, `np.zeros_like`, `np.mean`, and the `A.T`
transpose property.

## Features

- 🚀 **Python Parity Target** - NumPy benchmark evidence is required before parity claims
- 🎯 **NumPy-Compatible** - Python function spelling, argument order, dtype, shape, and broadcasting behavior are the target
- 📦 **Type Safe** - Full TypeScript support with generic types
- 🔢 **Multiple Data Types** - Support for int32, float32, float64, uint8
- 🧮 **Comprehensive** - 251+ functions covering linear algebra, statistics, FFT, and more
- ⚡ **Pragmatic FP** - Immutable external API with optimized internal operations for maximum performance

## Installation

After the gated npm release:

```bash
npm install @sylphx/numpy
```

## Quick Start

```typescript
import * as np from '@sylphx/numpy'

// Create arrays
const a = np.array([1, 2, 3, 4])
const b = np.array([5, 6, 7, 8])

// Mathematical operations (functional API)
const sum = np.add(a, b)  // [6, 8, 10, 12]
const product = np.dot(a, b)  // 70

// Statistics
const avg = np.mean(a)  // 2.5

// FFT
const freq = np.fft(a)

// Linear algebra
const A = np.array([[1, 2], [3, 4]])
const B = np.array([[5, 6], [7, 8]])
const C = np.matmul(A, B)  // Matrix multiplication

// Convenience: .T property for transpose
const AT = A.T  // Transpose of A
```

## Design Philosophy

**Pragmatic Functional Programming + Native/WASM Backend Architecture**

`@sylphx/numpy` follows a pragmatic functional approach that balances purity
with performance:

- **Immutable External API**: All operations return new arrays, inputs are never modified
- **Optimized Internals**: Hot loops use mutable operations for maximum performance
- **Copy-aware Operations**: `reshape` reuses buffers when shape-only metadata changes are enough; operations such as `transpose` return contiguous output buffers for predictable backend performance
- **Functional Core**: Pure functions for all computations - same input always produces same output
- **Backend System**: TypeScript (always available), WASM, and native BLAS acceleration paths

```typescript
// ✅ Immutable API - inputs never change
const a = array([1, 2, 3])
const b = add(a, 10)  // Returns new array [11, 12, 13]
// a is still [1, 2, 3]

// ✅ Shape metadata reuse where valid
const reshaped = reshape(a, [3, 1])  // Shares buffer with a
const transposed = A.T  // Returns a transposed array

// ✅ Functional composition
import { pipe, mean, abs, sqrt } from '@sylphx/numpy'
const rms = pipe(data, x => mul(x, x), mean, sqrt)
```

## Feature Coverage

**Current Progress: 251 / ~600 NumPy operation families (~42% feature parity), plus compatibility aliases**

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
| `mod` | 🟦 | 🟧 | ✅ | Modulo |
| `fmod` | 🟦 | 🟧 | ✅ | Float modulo |
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
| `outer` | 🟦 | 🟧 | ✅ | Outer product |
| `inner` | 🟦 | 🟧 | ✅ | Inner product |
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
| `trace` | 🟦 | 🟧 | ✅ | Matrix trace |
| `norm` | 🟦 | 🟧 | ✅ | Vector/matrix norm |
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
| `sin`, `cos`, `tan`, `arctan2` | 🟦 | 🟧 | ✅ | Trigonometric |
| `arcsin`, `arccos`, `arctan` | 🟦 | 🟧 | ✅ | Inverse trig |
| `sinh`, `cosh`, `tanh` | 🟦 | 🟧 | ✅ | Hyperbolic |
| `asinh`, `acosh`, `atanh` | 🟦 | 🟧 | ✅ | Inverse hyperbolic |
| `exp`, `exp2`, `expm1` | 🟦 | 🟧 | ✅ | Exponential |
| `log`, `log2`, `log10`, `log1p` | 🟦 | 🟧 | ✅ | Logarithmic |
| `sqrt`, `cbrt`, `square` | 🟦 | 🟧 | ✅ | Powers/roots |
| `abs`, `sign` | 🟦 | 🟧 | ✅ | Sign operations |
| `round`, `floor`, `ceil`, `trunc` | 🟦 | 🟧 | ✅ | Rounding |
| `maximum`, `minimum`, `clip` | 🟦 | 🟧 | ✅ | Comparisons |
| `mod`, `fmod` | 🟦 | 🟧 | ✅ | Modulo |
| `deg2rad`, `rad2deg`, `hypot`, `sinc`, `heaviside`, `gcd`, `lcm`, `reciprocal` | 🟦 | 🟧 | ✅ | Utilities |

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
| `prod`, `median`, `percentile`, `quantile` | 🟦 | 🟧 | ✅ | Basic stats |
| `average`, `ptp` | 🟦 | ⬜ | ✅ | Advanced stats |
| `corrcoef`, `cov` | 🟦 | ⬜ | ✅ | Correlation |
| `histogram`, `bincount`, `digitize` | 🟦 | ⬜ | ✅ | Binning |
| `nan*` functions (11) | 🟦 | ⬜ | ✅ | NaN-aware |
| `argmin`, `argmax`, `argwhere` | 🟦 | 🟧 | ✅ | Indices |

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
| **Core Ops** | 251 | 251 ✅ | 251 🟦 | 63 🟧 | 251 ✅ |
| **WASM Coverage** | 69/251 | **27.5%** | - | - | - |
| **Test Evidence** | CI suite | Package and native backend tests | - | - | - |

### WASM Implementation Priority

**🎯 Next Priority** (benchmark-gated):
1. **Linear Algebra** (`solve`, `qr`, `svd`, `eig`) - move more operations onto native/WASM kernels and prove gains with repo benchmarks
2. **2D/ND FFT** (`fft2`, `fftn`, `rfft2`, `rfftn`) - widen accelerated coverage without claiming speedups before evidence
3. **Real FFT** (`rfft`, `irfft`) - close the remaining FFT coverage gaps through the same benchmark admission path

**✅ Dual Backend** (63 operations):
- Arithmetic: add, sub, mul, div, pow (5)
- Reductions: sum, mean, max, min, std, variance/var, prod, argmax, argmin (9)
- Linear Algebra: matmul, dot, inv, det, transpose, trace, outer, inner, norm (9)
- FFT: fft, ifft (2)
- Math: abs, sign, sqrt, cbrt, square, reciprocal, exp, exp2, expm1, log, log2, log10, log1p, round, floor, ceil, trunc, maximum, minimum, clip, mod, fmod, deg2rad, rad2deg, hypot, sin, cos, tan, sinh, cosh, tanh, arcsin, arccos, arctan, arctan2, asinh, acosh, atanh (38)

### ✅ Implemented Operation Families (251)

#### Array Creation (28 functions)
- **Basic**: `array`, `zeros`, `ones`, `full`, `empty`, `arange`, `linspace`, `logspace`, `geomspace`
- **Like functions**: `zeros_like`, `ones_like`, `full_like`, `empty_like` plus `zerosLike`, `onesLike`, `fullLike`, `emptyLike` aliases
- **Special**: `eye`, `identity`, `diag`, `diagflat`, `tri`, `tril`, `triu`, `meshgrid`, `fromfunction`, `indices`, `vander`
- **Copy**: `asarray`, `copy`

#### Array Manipulation (45 functions)
- **Shape**: `reshape`, `flatten`, `ravel`, `squeeze`, `expand_dims`, `expandDims`, `transpose`, `swapaxes`, `moveaxis`
- **Join/Split**: `concatenate`, `concat`, `stack`, `vstack`, `hstack`, `dstack`, `split`, `hsplit`, `vsplit`, `array_split`
- **Rearrange**: `flip`, `rot90`, `roll`, `repeat`, `tile`
- **Modify**: `delete`, `deleteArr`, `insert`, `append`, `resize`, `pad`
- **Assembly**: `block`, `column_stack`

#### Mathematical Functions (35 functions)
- **Arithmetic**: `add`, `subtract`, `multiply`, `divide`, `power`, `sub`, `mul`, `div`, `pow`, `mod`, `fmod`, `divmod`
- **Trigonometric**: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`, `arctan2`
- **Hyperbolic**: `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`
- **Exponential**: `exp`, `exp2`, `log`, `log2`, `log10`, `log1p`, `expm1`
- **Rounding**: `round`, `floor`, `ceil`, `trunc`
- **Other**: `abs`, `absolute`, `sign`, `sqrt`, `cbrt`, `square`, `reciprocal`, `clip`, `maximum`, `minimum`

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
- **Basic**: `mean`, `median`, `std`, `var`, `variance`, `sum`, `prod`, `amin`, `amax`, `min`, `max`, `ptp`
- **Advanced**: `average`, `percentile`, `quantile`, `corrcoef`, `cov`, `histogram`, `bincount`
- **NaN-aware**: `nanmean`, `nansum`, `nanmin`, `nanmax`, `nanstd`, `nanmedian`, `nanvar`, `nanpercentile`, `nanquantile`, `nanprod`
- **Search**: `argmin`, `argmax`, `argwhere`, `digitize`

#### Logical Operations (12 functions)
- **Element-wise**: `all`, `any`, `logical_and`, `logical_or`, `logical_not`, `logical_xor`, `logicalAnd`, `logicalOr`, `logicalNot`, `logicalXor`
- **Comparison**: `equal`, `less`, `greater`, `less_equal`, `greater_equal`, `lessEqual`, `greaterEqual`, `not_equal`

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
- [ ] **Array Type Conversion**: `asanyarray`, `asfortranarray`, `asmatrix`

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

### Backend Architecture

`@sylphx/numpy` separates the TypeScript API from execution backends so public
DX can stay NumPy-like while hot kernels move to native implementations as they
mature:

```typescript
User Code -> NDArray API -> Backend Interface -> native BLAS, WASM, or TypeScript fallback
```

**TypeScript Backend**: Always available, pure TS implementation
- Ensures reliability - works everywhere
- Fallback for environments without WASM support
- Reference implementation for correctness

**Native BLAS Backend**: Bun/macOS fast path through Accelerate
- Float64 hot kernels for vector arithmetic, reductions, matmul, and transpose
- Used by the Python parity benchmark when available
- Falls back to TypeScript for unsupported dtypes and operations

**WASM Backend**: Portable acceleration path
- Available as a non-native fallback acceleration layer
- Cache-oriented algorithms for selected kernels
- Still subject to the Python parity gate before speed claims are made

**Current Backend Coverage**:
- ✅ Arithmetic operations (add, sub, mul, div, pow)
- ✅ Reductions (sum, mean, max, min, std, variance)
- ✅ Linear algebra (matmul, dot, inv, det, transpose)
- ✅ FFT operations (fft, ifft)
- ✅ Math functions (sin, cos, tan, sinh, cosh, tanh, arcsin, arccos, arctan, arctan2, asinh, acosh, atanh, exp, exp2, expm1, log, log2, log10, log1p, abs, sign, sqrt, cbrt, square, round, floor, ceil, trunc, maximum, minimum, clip, mod, fmod)

### Benchmarks

Run the Python parity benchmark before making public performance claims:

```bash
bun run bench:python-parity
bun run bench:python-parity:enforce
bun run bench:python-parity:repeatability
bun run bench:native-dispatch
```

Recent CI evidence:

- Checksum parity: all covered benchmark cases pass.
- Reporting-mode speed evidence: recorded main CI run `28701383776` passed
  checksum parity for every covered row and still had near-threshold misses in
  `add_arrays_1m_out` (`1.25x`), `add_scalar_1m_out` (`1.05x`), and
  `matmul_128` (`1.10x`). Recent accepted main snapshots move the failing rows
  around the output-buffer and small-matmul boundary, so repeatability remains
  a release blocker rather than a marketing claim.
- Release gate evidence: `bench:python-parity:repeatability` and
  `release:preflight` remain blockers until every covered speed row passes
  repeatably. Full speed parity is not marketed until that release gate passes.
- Diagnostic evidence: `bench:native-dispatch` separates Rust/N-API kernel,
  TypeScript backend, NativeBLAS backend, and public API overhead before backend
  dispatch changes are promoted.

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed benchmarks and methodology.

## API Documentation

### Array Creation

```typescript
import { array, zeros, ones, arange, linspace } from '@sylphx/numpy'

const a = array([1, 2, 3, 4])
const b = zeros([3, 4])
const c = ones([2, 2], { dtype: 'float64' })
const d = arange(0, 10, 2)  // [0, 2, 4, 6, 8]
const e = linspace(0, 1, 5)  // [0, 0.25, 0.5, 0.75, 1]
```

### Mathematical Operations

```typescript
import { add, exp, multiply, sin } from '@sylphx/numpy'

const a = array([1, 2, 3])
const b = array([4, 5, 6])

// Element-wise operations
const sum = add(a, b)  // [5, 7, 9]
const product = multiply(a, b)  // [4, 10, 18]

// Math functions
const s = sin(a)
const e = exp(a)
```

NumPy canonical names `subtract`, `multiply`, `divide`, `power`,
`identity`, `absolute`, `amax`, `amin`, `ravel`, `concatenate`, `delete`,
`expand_dims`, `var`, `logical_and`, `logical_or`, `logical_not`,
`logical_xor`, `less_equal`, and `greater_equal` are exported.
Existing short aliases such as `sub`, `mul`, `div`, `pow`, `concat`,
`deleteArr`, `expandDims`, `variance`, `logicalAnd`, `logicalOr`,
`logicalNot`, `logicalXor`, `lessEqual`, and `greaterEqual` remain available
for compatibility.

### Linear Algebra

```typescript
import { array, empty, add, multiply, matmul, dot, inv, eig, svd } from '@sylphx/numpy'

const A = array([[1, 2], [3, 4]])
const B = array([[5, 6], [7, 8]])

// Matrix multiplication
const C = matmul(A, B)

// Preallocated output for allocation-sensitive hot loops
const out = empty([2, 2], { dtype: 'float64' })
matmul(A, B, { out })

const scratch = empty([4], { dtype: 'float64' })
add(array([1, 2, 3, 4], { dtype: 'float64' }), 5, { out: scratch })
multiply(scratch, 2, { out: scratch })

// Matrix inverse
const Ainv = inv(A)

// Eigenvalues and eigenvectors
const { values, vectors } = eig(A)

// SVD
const { U, S, Vt } = svd(A)
```

### Statistics

```typescript
import { mean, std, median, percentile } from '@sylphx/numpy'

const data = array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const avg = mean(data)  // 5.5
const stdDev = std(data)  // 2.87...
const med = median(data)  // 5.5
const p90 = percentile(data, 90)  // 9.1
```

### FFT

```typescript
import { fft, ifft, fftfreq, fftshift } from '@sylphx/numpy'

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
import { array, div, mean, std, sub, type DType, type NDArray } from '@sylphx/numpy'

// Type inference
const a = array([1, 2, 3])  // NDArray<'int32'>
const b = array([1.5, 2.5], { dtype: 'float64' })  // NDArray<'float64'>

// Generic functions
function normalize<T extends DType>(arr: NDArray<T>): NDArray<'float64'> {
  const m = mean(arr)
  const s = std(arr)
  return div(sub(arr, m), s)
}
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Build
bun run build

# Python parity benchmark
bun run bench:python-parity
```

## Testing

430 package tests plus native backend tests cover implemented features and
backend semantics:

```bash
bun run test

# Output:
# ✓ 430 package tests pass
# ✓ native backend tests pass
# ✓ 0 fail
```

## License

MIT

## Contributing

Contributions welcome! See the feature coverage above for areas that need implementation.

## Acknowledgments

- Inspired by [NumPy](https://numpy.org/)
- Native and WASM acceleration paths powered by backend-specific kernels
- Built with TypeScript and Bun
