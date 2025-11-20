# tsnum

High-performance TypeScript NumPy alternative with **functional-first** API.

**Features:**
- 🎯 **Functional-first design** - Pure functions, composable operations
- 🚀 NumPy-compatible API for TypeScript
- 📊 **Broadcasting** - NumPy-style array broadcasting
- 🔍 **Indexing & Slicing** - Element access, slicing, fancy indexing
- ⚡ **WASM-first backend** - Automatic WASM acceleration with TS fallback
- 🌳 Tree-shakeable - import only what you need
- 📦 Lightweight core (~7KB gzipped)
- 🔒 Full TypeScript type safety
- 💨 Zero runtime dependencies
- 🎨 Elegant `pipe` composition

## Installation

```bash
bun add tsnum
# or
npm install tsnum
```

## Quick Start (Functional-First)

```typescript
import * as tn from 'tsnum'
import { pipe } from 'tsnum'

// ===== NumPy-style: Functional API =====
const a = tn.array([1, 2, 3])
const b = tn.add(a, 5)           // [6, 7, 8]
const result = tn.sum(b)         // 21

// ===== Elegant pipe composition =====
const result = pipe(
  tn.array([[1, 2], [3, 4]]),
  d => tn.reshape(d, [4]),
  d => tn.add(d, 10),
  d => tn.mul(d, 2),
  tn.sum
)  // 100

// ===== Complex transformations =====
const normalize = (data: NDArray) => pipe(
  data,
  d => tn.sub(d, tn.mean(d)),
  d => tn.div(d, tn.std(d))
)

const normalized = normalize(myData)
```

## API Overview

### Creation (Functional-only)
```typescript
import { array, zeros, ones, arange, linspace, eye } from 'tsnum'

const a = array([1, 2, 3])
const b = zeros([3, 3])
const c = ones([2, 2], { dtype: 'float32' })
const d = arange(0, 10, 2)        // [0, 2, 4, 6, 8]
const e = linspace(0, 1, 5)       // [0, 0.25, 0.5, 0.75, 1]
const f = eye(3)                  // 3x3 identity matrix
```

### Arithmetic Operations
```typescript
import { add, sub, mul, div, pow } from 'tsnum'

const a = array([1, 2, 3])

// Functional API (primary)
const b = add(a, 5)               // [6, 7, 8]
const c = mul(a, 2)               // [2, 4, 6]
const d = pow(a, 2)               // [1, 4, 9]

// Works with arrays
const x = array([1, 2, 3])
const y = array([4, 5, 6])
const z = add(x, y)               // [5, 7, 9]
```

### Reductions
```typescript
import { sum, mean, max, min, std, variance } from 'tsnum'

const a = array([1, 2, 3, 4, 5])

sum(a)                            // 15
mean(a)                           // 3
max(a)                            // 5
min(a)                            // 1
std(a)                            // standard deviation
variance(a)                       // variance
```

### Shape Operations
```typescript
import { reshape, transpose, flatten } from 'tsnum'

const a = array([[1, 2], [3, 4]])

reshape(a, [4])                   // [1, 2, 3, 4]
transpose(a)                      // [[1, 3], [2, 4]]
flatten(a)                        // [1, 2, 3, 4]

// Special property: .T for transpose
a.T                               // [[1, 3], [2, 4]]
```

### Comparison
```typescript
import { equal, less, greater, lessEqual, greaterEqual } from 'tsnum'

const a = array([1, 2, 3])

equal(a, 2)                       // [0, 1, 0]
less(a, 3)                        // [1, 1, 0]
greater(a, 1)                     // [0, 1, 1]
```

### Indexing & Slicing
```typescript
import { array, at, slice, take } from 'tsnum'

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

### Broadcasting
```typescript
import { array, add, mul } from 'tsnum'

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
import { pipe } from 'tsnum'
import * as tn from 'tsnum'

// ===== Example 1: Data normalization =====
const normalize = (data: NDArray) => pipe(
  data,
  d => tn.sub(d, tn.mean(d)),      // Center around mean
  d => tn.div(d, tn.std(d))         // Scale by std deviation
)

const normalized = normalize(myData)

// ===== Example 2: Complex transformation =====
const result = pipe(
  tn.arange(12),
  d => tn.reshape(d, [3, 4]),
  tn.transpose,
  d => tn.add(d, 10),
  d => tn.mul(d, 2),
  tn.sum
)

// ===== Example 3: Reusable transformations =====
const add5 = (a: NDArray) => tn.add(a, 5)
const double = (a: NDArray) => tn.mul(a, 2)
const square = (a: NDArray) => tn.pow(a, 2)

const transform = (data: NDArray) => pipe(
  data,
  add5,
  double,
  square,
  tn.sum
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
// TypeScript tsnum (functional + pipe - more elegant!)
import * as tn from 'tsnum'
import { pipe } from 'tsnum'

const data = tn.array([[1, 2], [3, 4]])

// With pipe (recommended)
const result = pipe(
  data,
  d => tn.reshape(d, [4]),
  d => tn.add(d, 10),
  d => tn.mul(d, 2),
  tn.sum
)

// Or with intermediate variables (NumPy style)
const reshaped = tn.reshape(data, [4])
const added = tn.add(reshaped, 10)
const multiplied = tn.mul(added, 2)
const result2 = tn.sum(multiplied)
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
// ❌ Method chaining (not available in tsnum)
data.reshape([4]).add(10).mul(2).sum()

// ✅ pipe (elegant and functional)
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
- No OOP overhead
- Smaller bundle size
- More flexible composition
- Matches functional programming idioms

## Performance

### WASM-First Architecture

tsnum uses a **WASM-first backend** with automatic TypeScript fallback:

```typescript
import { initWASM, getBackendInfo } from 'tsnum'

// Optional: Preload WASM during app startup
await initWASM()

// Check which backend is active
const info = getBackendInfo()
console.log(info.name)  // 'wasm' or 'typescript'
console.log(info.usingWASM)  // true if WASM loaded
```

**How it works:**
- 🚀 **WASM-first**: If WebAssembly available, use it (near-native performance)
- 🔄 **Automatic fallback**: If WASM unavailable, seamlessly fall back to TypeScript
- 🎯 **No configuration**: Just works - no threshold logic or manual switching
- ⚡ **Lazy loading**: WASM loads on first operation (or manually with `initWASM()`)

**Performance:**
- **WASM backend**: Near-native performance, SIMD support
- **TypeScript backend**: Competitive with NumPy.js, zero overhead
- **Tree-shakeable**: Only bundle what you use
- **No OOP overhead**: Pure functions throughout

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
- [x] v0.3: WASM-first backend infrastructure (Rust WASM module in progress)
- [ ] v0.4: Complete WASM implementation (arithmetic, reductions)
- [ ] v0.5: Linear algebra (matmul, inv, solve, svd)
- [ ] v0.6: Random number generation, advanced statistics
- [ ] v0.7: FFT operations

## Why tsnum?

| Feature | tsnum | NumPy.js | ndarrays |
|---------|-------|----------|----------|
| **Functional-first** | ✅ | ❌ | ❌ |
| **pipe composition** | ✅ | ❌ | ❌ |
| **Tree-shakeable** | ✅ | ⚠️ | ⚠️ |
| **TypeScript native** | ✅ | ⚠️ | ✅ |
| **NumPy-compatible** | ✅ | ✅ | ❌ |
| **Bundle size** | ~20KB | ~200KB | ~50KB |
| **Zero dependencies** | ✅ | ❌ | ✅ |

## License

MIT

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.
