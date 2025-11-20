# Architecture

## System Overview
Hybrid functional-OOP design: Pure data structures (NDArrayData) with immutable operations, wrapped in ergonomic NDArray class. Two API styles coexist:
1. **OOP shell** (`array([1,2]).add(3).sum()`) - NumPy-like, method chaining
2. **Functional core** (`pipe(array([1,2]), arr => add(arr, 3), sum)`) - tree-shakeable, composable

**Data flow:** TypedArray storage → NDArrayData (pure) → NDArray (methods) or functional ops → new NDArrayData

**Monorepo structure:** Turbo-based, single package (`packages/tsnum`) initially, future WASM package separate.

## Key Components
- **`src/core/`**: Pure data structures, dtype system, shape utilities
  - `types.ts`: DType definitions, NDArrayData interface
  - `utils.ts`: Shape computation, strides, broadcasting logic

- **`src/ndarray.ts`**: NDArray class (thin OOP wrapper over NDArrayData)
  - Delegates to internal operations
  - Immutable by default (returns new instances)
  - Properties: `.shape`, `.dtype`, `.T`, `.ndim`

- **`src/creation.ts`**: Factory functions (`array`, `zeros`, `ones`, `arange`, `linspace`, `eye`)

- **`src/ops/`**: Pure functional operations (tree-shakeable)
  - Export individual functions: `add`, `mul`, `sum`, `transpose`
  - Delegate to NDArray methods internally (v1), future: direct implementation

- **`src/functional.ts`**: Composition utilities (`pipe`, `compose`)

- **`src/linalg/`**: Linear algebra module (placeholder for v1)

## Design Patterns

### Pattern: Functional Core + OOP Shell
**Why:** Combine tree-shaking benefits (functional) with ergonomic API (OOP). Users import only what they use.

**Where:** All operations exist as:
1. NDArray methods: `arr.add(5)`
2. Standalone functions: `add(arr, 5)`

**Trade-off:** Code duplication vs flexibility. Small duplication acceptable for API ergonomics. Future: methods delegate to pure functions.

**Example:**
```ts
// OOP style
array([1,2,3]).add(10).sum()

// Functional style (tree-shakeable)
import { add, sum } from 'tsnum/ops'
sum(add(array([1,2,3]), 10))
```

### Pattern: Pure Data + Computed Strides
**Why:** C-contiguous (row-major) memory layout matches TypedArrays, enables zero-copy with WASM.

**Where:** `NDArrayData` structure, `computeStrides()` utility

**Trade-off:** Strided arrays more complex than nested arrays, but enables views/slicing without copying (future feature).

### Pattern: TypedArray Backends
**Why:** Native performance, WASM interop, dtype enforcement at runtime.

**Where:** `DTYPE_TO_TYPEDARRAY` mapping, buffer creation

**Trade-off:** Less flexible than generic `number[]`, but 2-10x faster and enables WASM zero-copy.

### Pattern: Threshold-based WASM Selection (Future)
**Why:** Small arrays have JS overhead, large arrays benefit from WASM SIMD.

**Where:** Operations like `matmul`, `dot` (not yet implemented)

**Trade-off:** Complexity vs performance. Threshold tuning required. Plan: <1000 elements → pure TS, ≥1000 → WASM.

## Boundaries
**In scope (current):**
- Pure TypeScript implementation
- Basic operations (arithmetic, reductions, shape manipulation)
- NumPy-compatible API surface
- Full test coverage for core

**Out of scope (current):**
- WASM implementation (v0.2+)
- Broadcasting (v0.2)
- Advanced indexing/slicing (v0.2)
- In-place operations (v0.3)
- Linear algebra (v0.3+)

## SSOT References
- Build: `turbo.json` (pipeline), `tsconfig.json` (TS config)
- Tests: Bun test (`*.test.ts` files)
- Package structure: `package.json` exports field
