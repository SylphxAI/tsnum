# Architecture

## System Overview
**Pure functional-first design**: Pure data structures (NDArrayData) with immutable operations. NDArray is a lightweight data container with read-only properties only. All operations are module-level pure functions.

**API style:** Functional composition (`pipe(array([1,2]), a => add(a, 3), sum)`) - tree-shakeable, composable, matches NumPy's functional core.

**Data flow:** TypedArray storage -> NDArrayData (pure) -> NDArray (data container) -> functional ops -> backend dispatch -> new NDArrayData

**Monorepo structure:** Turbo-based workspace with `packages/numpy` for the public TypeScript API, `packages/numpy-native` for Rust/N-API kernels, and `packages/numpy-wasm` for the portable WASM backend path.

## Key Components
- **`src/core/`**: Pure data structures, dtype system, shape utilities
  - `types.ts`: DType definitions, NDArrayData interface
  - `utils.ts`: Shape computation, strides, broadcasting logic

- **`src/ndarray.ts`**: NDArray class (pure data container, no operation methods)
  - Read-only properties: `.shape`, `.dtype`, `.T`, `.ndim`, `.size`
  - Utility methods: `.copy()`, `.toString()`, `.getData()`
  - Zero operation methods (all ops are pure functions)

- **`src/creation.ts`**: Factory functions (`array`, `zeros`, `ones`, `arange`, `linspace`, `eye`)

- **`src/ops/`**: Pure functional operations (tree-shakeable)
  - `arithmetic.ts`: add, sub, mul, div, pow
  - `comparison.ts`: equal, less, greater, lessEqual, greaterEqual
  - `reductions.ts`: sum, mean, max, min, std, variance
  - `shape.ts`: reshape, transpose, flatten
  - All operate directly on NDArrayData (no method delegation)

- **`src/functional.ts`**: Composition utilities (`pipe`, `compose`)

- **`src/linalg/`**: Linear algebra module (placeholder for v1)

## Design Patterns

### Pattern: Pure Functional-First (ADR-004)
**Why:** Maximum tree-shaking, best performance (no OOP overhead), matches NumPy's actual design, enables elegant `pipe` composition.

**Where:** All operations are module-level functions in `src/ops/`

**Trade-off:** No method chaining vs better performance and composition. `pipe` utility provides superior composition to method chaining.

**Example:**
```ts
// Primary API (functional)
import { add, array, pipe, sum } from '@sylphx/numpy'
sum(add(array([1,2,3]), 10))

// Elegant composition with pipe
pipe(
  array([1,2,3]),
  a => add(a, 10),
  sum
)
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

**Where:** Operations like `matmul`, `dot`, reductions, and native/WASM-backed array kernels.

**Trade-off:** Complexity vs performance. Threshold tuning required. Plan: <1000 elements → pure TS, ≥1000 → WASM.

## Boundaries
**In scope (current):**
- Pure TypeScript implementation and fallback backend
- Rust/N-API native kernels and macOS native BLAS paths for admitted hot loops
- WASM backend for supported operations
- NumPy-compatible API surface and Python parity benchmark evidence

**Out of scope (current):**
- Sparse arrays
- File I/O
- Plotting and visualization
- Distributed execution
- Undocumented in-place mutation APIs

## SSOT References
- Build: `turbo.json` and package-local TypeScript/Rust build metadata
- Tests: Bun test (`*.test.ts` files), Rust clippy, and Python parity benchmarks
- Package structure: `packages/numpy/package.json`, `packages/numpy-native/package.json`, and root workspace metadata
