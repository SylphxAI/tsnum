# tsnum

High-performance TypeScript NumPy alternative with WASM acceleration.

**Features:**
- 🚀 NumPy-like API for TypeScript
- ⚡ WASM acceleration for performance-critical operations (future)
- 🌳 Tree-shakeable functional API
- 📦 Lightweight core (<20KB gzipped)
- 🔒 Full TypeScript type safety
- 🎯 Zero runtime dependencies

## Installation

```bash
bun add tsnum
# or
npm install tsnum
```

## Quick Start

```typescript
import * as tn from 'tsnum'

// Create arrays
const a = tn.array([[1, 2], [3, 4]])
const b = tn.zeros([2, 2])
const c = tn.arange(0, 10, 2)  // [0, 2, 4, 6, 8]

// Operations (OOP style)
const result = a.add(10).mul(2).T.sum()

// Operations (Functional style - tree-shakeable)
import { add, mul, transpose, sum } from 'tsnum/ops'
import { pipe } from 'tsnum/fn'

const result = pipe(
  a,
  arr => add(arr, 10),
  arr => mul(arr, 2),
  transpose,
  sum
)
```

## API Highlights

### Creation
```typescript
import { array, zeros, ones, arange, linspace, eye } from 'tsnum'

const a = array([1, 2, 3])
const b = zeros([3, 3])
const c = ones([2, 2], { dtype: 'float32' })
const d = arange(0, 10, 2)
const e = linspace(0, 1, 5)
const f = eye(3)
```

### Operations
```typescript
// Arithmetic
a.add(b)      // or add(a, b)
a.sub(5)
a.mul(2)
a.div(10)
a.pow(2)

// Reductions
a.sum()
a.mean()
a.max()
a.min()

// Shape
a.reshape([2, 3])
a.transpose()  // or a.T
a.flatten()
```

### Comparison
```typescript
a.eq(5)       // element-wise equal
a.lt(10)      // less than
a.gt(0)       // greater than
```

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

- [x] v0.1: Core functionality (creation, arithmetic, reductions, shapes)
- [ ] v0.2: Broadcasting, advanced indexing, slicing
- [ ] v0.3: WASM acceleration, in-place operations
- [ ] v0.4: Linear algebra (matmul, inv, solve, svd)
- [ ] v0.5: Random number generation, statistics

## License

MIT
