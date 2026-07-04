# @sylphx/numpy - NumPy for TypeScript

NumPy-compatible numerical computing for TypeScript. The repository started as
`tsnum`; the public package contract is now `@sylphx/numpy`, with `np` as the
canonical import alias.

The mission is direct: make Python-grade numerical computing available inside
TypeScript without forcing teams to run a Python sidecar for every model,
agent, dashboard, or server workflow. The API target is NumPy spelling and
semantics; the performance target is NumPy-class native execution, admitted by
repository-local Python parity benchmarks.

This is not a JavaScript math toy. The TypeScript layer is the public developer
experience; hot paths are designed to drop into Rust/N-API kernels, native BLAS,
WASM, and future GPU backends while preserving a Python-recognizable `np` API.

Release gate: `@sylphx/numpy` npm publication must pass
`bun run bench:python-parity:enforce` and npm registry readback first. Until
that readback exists, treat the install command below as the post-release
package contract rather than current registry availability.

Launch and marketing claims are governed by
[`docs/adl/0001-python-parity-launch-contract.md`](docs/adl/0001-python-parity-launch-contract.md).

NumPy is a project of the NumPy community. This package is NumPy-compatible in
API direction and is not affiliated with, endorsed by, or sponsored by NumPy.

## Why Star This

- **Python ecosystem migration path** - Python users should recognize the
  namespace, function names, shapes, dtypes, broadcasting, and numerical
  vocabulary immediately.
- **Train and serve closer to your TypeScript stack** - the target is to make
  model training, simulation, analytics, and agent workflows viable without a
  permanent Python sidecar when the covered native backend path is enough.
- **Native-speed target, not JavaScript-only ambition** - TypeScript is the
  public language surface; hot operations are designed to route through
  Rust/N-API native kernels, native BLAS, WASM, and future GPU backends when the
  workload demands it.
- **Evidence-gated marketing** - this repo carries a NumPy comparison gate
  (`bun run bench:python-parity:enforce`) and a generated CI report artifact, so
  public performance claims are tied to reproducible measurements instead of
  README optimism.
- **Commercial package contract** - public examples, package metadata, release
  readback, and benchmark reports now point at `@sylphx/numpy`.

## Python Parity Status

The contract is strict: operations are only described as Python-parity when the
benchmark gate passes on the same machine against Python/NumPy.

| Area | Current state |
| --- | --- |
| API direction | NumPy-compatible spelling and behavior are the target. |
| Benchmarks | `bench/python-parity` compares TypeScript and NumPy on identical inputs. |
| Native path | Bun/macOS can initialize Rust/N-API and native BLAS fast paths for float64 hot loops. |
| Dispatch evidence | `bun run bench:native-dispatch` separates kernel, backend, and public API overhead before performance changes are promoted. |
| Proven today | Recorded accepted main CI snapshot passes checksum parity for every covered row and passes the 1.05x speed target on seven of ten covered rows. |
| Not claimed yet | `add_arrays_1m_out`, `matmul_128`, and `mul_scalar_1m_out` still miss the 1.05x speed target; full NumPy API coverage, repeatable all-op speed parity, and npm publication are still launch gates. |

Recorded accepted main CI snapshot as of 2026-07-04. The latest uploaded
`python-parity-report` artifact remains the canonical source when this table
drifts.
(run `28699887631`, commit `436637f`, macOS arm64, Python 3.12.10,
NumPy 2.5.0, Bun 1.3.14):

| Case | Speed vs NumPy | Status |
| --- | ---: | --- |
| `add_arrays_1m` | `0.71x` | pass |
| `add_arrays_1m_out` | `1.06x` | fail |
| `add_scalar_1m` | `0.65x` | pass |
| `add_scalar_1m_out` | `1.04x` | pass |
| `matmul_128` | `1.11x` | fail |
| `mean_1m` | `0.56x` | pass |
| `mul_scalar_1m` | `0.64x` | pass |
| `mul_scalar_1m_out` | `1.06x` | fail |
| `sum_1m` | `0.57x` | pass |
| `transpose_512` | `0.73x` | pass |

All covered checksums passed in that run. The same run's native dispatch probe
measured `public.addScalar.out` at `0.1888ms`, `public.addArrays.out` at
`0.3409ms`, `public.mulScalar.out` at `0.1895ms`, and `public.matmul128.out`
at `0.0797ms`. The accepted direction remains native-backed execution with
preallocated output support, while same-machine NumPy comparison still blocks
release. PR #45 was closed after rerun evidence failed `matmul_128` at `1.28x`,
which keeps the release rule stricter than the marketing copy: no full-speed
claim and no npm publish until the enforced gate passes repeatably on the
release path.

## Python-To-TypeScript Contract

The public syntax intentionally follows NumPy names instead of inventing a new
math DSL:

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

Where JavaScript syntax cannot match Python operators directly, the contract is
NumPy function spelling (`np.matmul`, `np.multiply`, `np.reshape`,
`np.zeros_like`) and Python-style array semantics.

Allocation-sensitive code can also use NumPy-style output buffers for supported
hot paths:

```typescript
const out = np.empty([128, 128], { dtype: 'float64' })
np.matmul(A, B, { out })          // returns out
const xScratch = np.empty([x.size], { dtype: 'float64' })
np.add(x, 5, { out: xScratch })   // ufunc-style output reuse
```

**Features:**
- 🎯 **NumPy-compatible DX** - Python spelling and behavior are the target
- 🚀 **Python parity gate** - Performance claims require NumPy benchmark evidence
- 📊 **Broadcasting** - NumPy-style array broadcasting
- 🔍 **Indexing & Slicing** - Element access, slicing, fancy indexing
- 🧮 **Math & Logic** - 20+ math functions, logical operations
- 📈 **Linear Algebra** - Matrix ops, decompositions (QR, SVD, Cholesky)
- 🎲 **Random & Stats** - Seedable RNG, distributions, statistics
- 🌊 **FFT Operations** - Fast Fourier Transform (Cooley-Tukey)
- ⚡ **Native/WASM backend path** - Rust/N-API, native BLAS, and WASM acceleration with TS fallback
- 🌳 Tree-shakeable - import only what you need
- 📦 Lightweight core with optional native acceleration
- 🔒 Full TypeScript type safety
- 💨 Zero required runtime dependencies; native kernels are optional packages
- 🎨 Elegant `pipe` composition

## Installation

After the gated npm release:

```bash
bun add @sylphx/numpy
# or
npm install @sylphx/numpy
```

## Quick Start

```typescript
import * as np from '@sylphx/numpy'

const a = np.array([1, 2, 3])
const b = np.add(a, 5)           // [6, 7, 8]
const result = np.sum(b)         // 21
```

## API Overview

### Creation (Functional-only)
```typescript
import { array, zeros, ones, arange, linspace, eye, identity } from '@sylphx/numpy'

const a = array([1, 2, 3])
const b = zeros([3, 3])
const c = ones([2, 2], { dtype: 'float32' })
const d = arange(0, 10, 2)        // [0, 2, 4, 6, 8]
const e = linspace(0, 1, 5)       // [0, 0.25, 0.5, 0.75, 1]
const f = eye(3)                  // 3x3 identity matrix
const g = identity(3)             // NumPy identity spelling
```

NumPy snake_case helpers such as `zeros_like`, `ones_like`, `full_like`, and
`empty_like` are exported alongside the existing camelCase aliases.

### Arithmetic Operations
```typescript
import { add, divide, multiply, power, subtract } from '@sylphx/numpy'

const a = array([1, 2, 3])

// Functional API (primary)
const b = add(a, 5)               // [6, 7, 8]
const c = multiply(a, 2)          // [2, 4, 6]
const d = power(a, 2)             // [1, 4, 9]
const e = subtract(c, a)          // [1, 2, 3]
const f = divide(c, 2)            // [1, 2, 3]

// Works with arrays
const x = array([1, 2, 3])
const y = array([4, 5, 6])
const z = add(x, y)               // [5, 7, 9]
```

`sub`, `mul`, `div`, and `pow` remain supported aliases; the canonical public
spelling tracks NumPy's `subtract`, `multiply`, `divide`, and `power`.

### Reductions
```typescript
import { amax, amin, sum, mean, max, min, std, variance } from '@sylphx/numpy'
import * as np from '@sylphx/numpy'

const a = array([1, 2, 3, 4, 5])

sum(a)                            // 15
mean(a)                           // 3
max(a)                            // 5
amax(a)                           // 5
min(a)                            // 1
amin(a)                           // 1
std(a)                            // standard deviation
variance(a)                       // variance
np.var(a)                         // NumPy namespace spelling
```

### Shape Operations
```typescript
import { expand_dims, ravel, reshape, transpose, flatten } from '@sylphx/numpy'

const a = array([[1, 2], [3, 4]])

reshape(a, [4])                   // [1, 2, 3, 4]
expand_dims(reshape(a, [4]), 0)    // shape [1, 4]
transpose(a)                      // [[1, 3], [2, 4]]
flatten(a)                        // [1, 2, 3, 4]
ravel(a)                          // [1, 2, 3, 4]

// Special property: .T for transpose
a.T                               // [[1, 3], [2, 4]]
```

### Comparison
```typescript
import { equal, less, greater, lessEqual, greaterEqual } from '@sylphx/numpy'

const a = array([1, 2, 3])

equal(a, 2)                       // [0, 1, 0]
less(a, 3)                        // [1, 1, 0]
greater(a, 1)                     // [0, 1, 1]
```

### Indexing & Slicing
```typescript
import { array, at, slice, take } from '@sylphx/numpy'

// Element access with at()
const arr = array([[1, 2, 3], [4, 5, 6]])
at(arr, 0, 2)                     // 3
at(arr, -1, -1)                   // 6 (negative indexing)

// Slicing
const a = array([0, 1, 2, 3, 4, 5])
slice(a, [1, 4])                  // [1, 2, 3]
slice(a, [0, 6, 2])               // [0, 2, 4] (with step)

// 2D slicing
const b = array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
slice(b, [0, 2], [1, 3])          // [[2, 3], [5, 6]]

// Fancy indexing
const c = array([10, 20, 30, 40, 50])
take(c, [0, 2, 4])                // [10, 30, 50]
```

### Math Functions
```typescript
import { abs, absolute, sign, sqrt, exp, log, sin, cos, tan, round, floor, ceil } from '@sylphx/numpy'

const a = array([1, 4, 9])

absolute(array([-1, 0, 3]))       // [1, 0, 3]
sqrt(a)                           // [1, 2, 3]
exp(a)                            // [e^1, e^4, e^9]
log(a)                            // [0, 1.386, 2.197]

// Trigonometric
const angles = array([0, Math.PI/2, Math.PI])
sin(angles)                       // [0, 1, 0]
cos(angles)                       // [1, 0, -1]

// Rounding
const vals = array([1.3, 2.5, 3.7])
round(vals)                       // [1, 3, 4]
floor(vals)                       // [1, 2, 3]
ceil(vals)                        // [2, 3, 4]
```

### Logical Operations
```typescript
import { all, any, logical_and, logical_or, logical_not, where } from '@sylphx/numpy'

const a = array([1, 0, 1])
const b = array([1, 1, 0])

all(a)                            // false (not all elements truthy)
any(a)                            // true (at least one truthy)

logical_and(a, b)                 // [1, 0, 0]
logical_or(a, b)                  // [1, 1, 1]
logical_not(a)                    // [0, 1, 0]

// Conditional selection
const cond = array([1, 0, 1])
const x = array([10, 20, 30])
const y = array([100, 200, 300])
where(cond, x, y)                 // [10, 200, 30]
```

### Sorting & Search
```typescript
import { sort, argsort, argmax, argmin } from '@sylphx/numpy'

const a = array([3, 1, 4, 1, 5])

sort(a)                           // [1, 1, 3, 4, 5]
argsort(a)                        // [1, 3, 0, 2, 4] (indices)
argmax(a)                         // 4 (index of max)
argmin(a)                         // 1 (index of min)
```

### Array Manipulation
```typescript
import { concat, stack, vstack, hstack, repeat } from '@sylphx/numpy'

const a = array([1, 2])
const b = array([3, 4])

concat([a, b])                    // [1, 2, 3, 4]
stack([a, b])                     // [[1, 2], [3, 4]]
vstack([a, b])                    // [[1, 2], [3, 4]]
hstack([a, b])                    // [1, 2, 3, 4]
repeat(a, 3)                      // [1, 2, 1, 2, 1, 2]
```

### Linear Algebra
```typescript
import { dot, matmul, inv, solve, det, trace, qr, svd, cholesky } from '@sylphx/numpy'

const A = array([[1, 2], [3, 4]])
const b = array([5, 6])

// Matrix operations
dot(a, b)                         // Inner product or matrix multiplication
matmul(A, A)                      // Matrix multiplication
inv(A)                            // Matrix inverse (2x2, 3x3)
solve(A, b)                       // Solve Ax = b
det(A)                            // Determinant
trace(A)                          // Trace (sum of diagonal)

// Matrix decompositions
const { q, r } = qr(A)            // QR decomposition
const { u, s, vt } = svd(A)       // Singular Value Decomposition (2x2)
const L = cholesky(A)             // Cholesky decomposition (positive-definite)
```

### Random Number Generation
```typescript
import { random, randn, randint, shuffle, choice, setSeed } from '@sylphx/numpy'

// Set seed for reproducibility
setSeed(42)

// Random values
random([3, 3])                    // 3x3 array of random [0, 1)
randn([1000])                     // Normal distribution (mean=0, std=1)
randint(0, 10, [5])               // Random integers [0, 10)

// Sampling
const arr = array([1, 2, 3, 4, 5])
shuffle(arr)                      // Randomly shuffle
choice(arr, 3)                    // Random choice (with replacement)
choice(arr, 3, false)             // Without replacement
```

### Advanced Statistics
```typescript
import { median, percentile, quantile, corrcoef, cov, histogram } from '@sylphx/numpy'

const a = array([1, 2, 3, 4, 5])

median(a)                         // 3
percentile(a, 75)                 // 75th percentile
quantile(a, 0.75)                 // Same as percentile(a, 75)

// Correlation and covariance
const x = array([1, 2, 3, 4])
const y = array([2, 4, 5, 8])
corrcoef(x, y)                    // 2x2 correlation matrix
cov(x, y)                         // 2x2 covariance matrix

// Histogram
const { counts, edges } = histogram(a, 10)
```

### FFT Operations
```typescript
import { fft, ifft, rfft, irfft } from '@sylphx/numpy'

const signal = array([1, 2, 1, 0, 1, 2, 1, 0])  // Length must be power of 2

// Forward FFT (returns complex values as [n, 2] array)
const spectrum = fft(signal)      // [[real, imag], [real, imag], ...]

// Inverse FFT
const reconstructed = ifft(spectrum)

// Real FFT (optimized for real-valued input)
const realSpec = rfft(signal)     // Only positive frequencies
const original = irfft(realSpec)
```

### Broadcasting
```typescript
import { array, add, mul } from '@sylphx/numpy'

// Scalar broadcasting
const a = array([1, 2, 3])
add(a, 10)                        // [11, 12, 13]

// 1D to 2D broadcasting
const b = array([[1, 2, 3], [4, 5, 6]])  // (2, 3)
const c = array([10, 20, 30])            // (3,)
add(b, c)                         // [[11, 22, 33], [14, 25, 36]]

// Broadcasting with size-1 dimensions
const d = array([[1], [2], [3]])  // (3, 1)
const e = array([[10, 20, 30, 40]])  // (1, 4)
add(d, e)                         // (3, 4) result
// [[11, 21, 31, 41],
//  [12, 22, 32, 42],
//  [13, 23, 33, 43]]
```

### Properties (Read-only)
```typescript
const a = array([[1, 2], [3, 4]])

a.shape                           // [2, 2]
a.dtype                           // 'int32' or 'float64'
a.ndim                            // 2
a.size                            // 4
a.T                               // Transpose
```

## Functional Composition with `pipe`

```typescript
import { pipe } from '@sylphx/numpy'
import * as np from '@sylphx/numpy'
import type { NDArray } from '@sylphx/numpy'

// ===== Example 1: Data normalization =====
const normalize = (data: NDArray) => pipe(
  data,
  d => np.sub(d, np.mean(d)),      // Center around mean
  d => np.div(d, np.std(d))         // Scale by std deviation
)

const normalized = normalize(myData)

// ===== Example 2: Complex transformation =====
const result = pipe(
  np.arange(12),
  d => np.reshape(d, [3, 4]),
  np.transpose,
  d => np.add(d, 10),
  d => np.mul(d, 2),
  np.sum
)

// ===== Example 3: Reusable transformations =====
const add5 = (a: NDArray) => np.add(a, 5)
const double = (a: NDArray) => np.mul(a, 2)
const square = (a: NDArray) => np.pow(a, 2)

const transform = (data: NDArray) => pipe(
  data,
  add5,
  double,
  square,
  np.sum
)
```

## NumPy Comparison

```python
# Python NumPy
import numpy as np

data = np.array([[1, 2], [3, 4]])
result = np.sum(np.multiply(np.add(np.reshape(data, (4,)), 10), 2))

# Or with intermediate variables
reshaped = np.reshape(data, (4,))
added = np.add(reshaped, 10)
multiplied = np.multiply(added, 2)
result = np.sum(multiplied)
```

```typescript
// TypeScript with @sylphx/numpy
import * as np from '@sylphx/numpy'
import { pipe } from '@sylphx/numpy'

const data = np.array([[1, 2], [3, 4]])

// With pipe (recommended)
const result = pipe(
  data,
  d => np.reshape(d, [4]),
  d => np.add(d, 10),
  d => np.mul(d, 2),
  np.sum
)

// Or with intermediate variables (NumPy style)
const reshaped = np.reshape(data, [4])
const added = np.add(reshaped, 10)
const multiplied = np.mul(added, 2)
const result2 = np.sum(multiplied)
```

## Design Philosophy

### Why Functional-First?

1. **Pure functions** - No side effects, easier to reason about
2. **Tree-shakeable** - Import only what you use
3. **Composable** - Combine operations elegantly with `pipe`
4. **NumPy-compatible** - Matches NumPy's functional API
5. **Type-safe** - Full TypeScript inference

### Why `pipe` over method chaining?

```typescript
// Method chaining is not the current public API.
data.reshape([4]).add(10).mul(2).sum()

// Use pipe or NumPy-style functions instead.
pipe(
  data,
  d => reshape(d, [4]),
  d => add(d, 10),
  d => mul(d, 2),
  sum
)
```

**Advantages of `pipe`:**
- Works with any function
- No method chaining required
- Smaller bundle size
- More flexible composition
- Matches functional programming idioms

## Performance

### Backend Architecture

`@sylphx/numpy` keeps the public API in TypeScript while routing hot paths
through the best available backend:

```typescript
import { getBackendInfo, initNativeBLAS, initWASM } from '@sylphx/numpy'

// Optional: preload an accelerated backend during app startup
await initNativeBLAS()
await initWASM()

// Check which backend is active
const info = getBackendInfo()
console.log(info.name)  // 'native-blas', 'wasm', or 'typescript'
console.log(info.usingWASM)  // true if WASM loaded
```

**How it works:**
- **Native path**: Rust/N-API kernels and Bun/macOS Accelerate cover selected
  float64 hot loops.
- **WASM path**: portable acceleration for supported operations.
- **TypeScript fallback**: always available reference implementation.
- **Explicit preload**: accelerated backends can be initialized during startup.

**Performance:**
- **Native/WASM backend paths**: Accelerated execution for covered hot paths
- **TypeScript backend**: Always-available fallback with tuned hot loops
- **Native dispatch probe**: `bun run bench:native-dispatch` shows whether a
  proposed backend change improves native kernel, backend, or public API timing
- **Python parity gate**: Run `bun run bench:python-parity:enforce` before
  publishing NumPy-speed claims
- **Tree-shakeable**: Only bundle what you use
- **Functional API**: operations are exposed as composable functions over a thin
  NDArray container

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Lint
bun run lint
```

## Roadmap

- [x] v0.1: Core functional API (creation, arithmetic, reductions, shapes)
- [x] v0.2: Broadcasting, indexing, slicing
- [x] v0.3: Backend infrastructure (Rust WASM module)
- [x] v0.4: Complete WASM implementation (arithmetic, reductions)
- [x] v0.5: Math functions (20+ functions: trig, exp, log, rounding)
- [x] v0.6: Logical operations, sorting, array manipulation
- [x] v0.7: Linear algebra (matmul, inv, solve, det, norm, qr, svd, cholesky)
- [x] v0.8: Random number generation (seedable, normal distribution, sampling)
- [x] v0.9: Advanced statistics (median, percentile, correlation, covariance)
- [x] v1.0: FFT operations (fft, ifft, rfft, irfft)

**Status:** Broad NumPy-compatible surface with 251+ implemented operations and
an explicit Python parity performance gate, native dispatch diagnostics, and
release readback wiring. Recent CI artifacts consistently pass checksum parity,
but 1.05x speed parity is still volatile across reporting and enforced runs.
Full NumPy API coverage, repeatable all-op speed parity, and first npm
publication remain launch gates, not completed claims.

Next: make `bench:python-parity:enforce` repeatably pass on the release path,
harden GPU acceleration contract, and add more decompositions (LU,
eigendecomposition).

## Why @sylphx/numpy?

| Feature | @sylphx/numpy | NumPy.js | ndarrays |
|---------|-------|----------|----------|
| **Functional-first** | Yes | No | No |
| **pipe composition** | Yes | No | No |
| **Tree-shakeable** | Yes | Partial | Partial |
| **TypeScript native** | Yes | Partial | Yes |
| **NumPy-compatible target** | Yes | Yes | No |
| **Bundle size** | ~20KB | ~200KB | ~50KB |
| **Required runtime dependencies** | None | Yes | None |

## License

MIT

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.
