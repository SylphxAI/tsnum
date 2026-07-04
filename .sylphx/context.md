# Project Context

## What (Internal)
TypeScript NumPy alternative (tsnum): High-performance n-dimensional array library for TypeScript/JavaScript with WASM acceleration.

**Scope:**
- NumPy-compatible API for TypeScript
- Pure TS fallback plus optional WASM, Rust/N-API, and native BLAS acceleration
- Tree-shakeable functional API
- Browser + Node.js support according to backend availability

**Target:** TypeScript developers needing NumPy-compatible functionality and
NumPy-class speed without a Python runtime.

**Out of scope (current package):**
- Sparse arrays
- File I/O (CSV, NPY)
- Plotting/visualization
- Distributed arrays

## Why (Business/Internal)
**Market gap:** Python dominates scientific computing, but TypeScript/JavaScript ecosystem lacks mature numerical computing library. Existing TS libraries are either incomplete, have large bundles, or poor type safety.

**Opportunity:** Capture web developers doing ML/data science in browser, full-stack devs needing shared logic between Python and TS, and education (teaching NumPy concepts in familiar JS environment).

## Key Constraints
**Technical:**
- Bundle <20KB core (excluding WASM) - edge function compatibility
- Node 18+ (native ESM, WebAssembly support)
- Browser ES2020+ (TypedArrays, WASM, BigInt)
- Zero runtime dependencies (core package)

**Business:**
- MIT license (permissive, compatible with NumPy ecosystem)
- Open source, community-driven
- No telemetry (privacy-first)

**Performance:**
- Product target: same-speed parity with NumPy for covered operations.
- Admission gate: tsnum wall time must be <=1.05x NumPy wall time on the same
  hardware, dtype, shape, and warmup policy before a parity claim is allowed.
- Benchmark evidence: `bun run bench:python-parity` and
  `bun run bench:python-parity:enforce`.
- Threshold-based auto-selection (small arrays -> TS, large -> WASM/native)
  remains an implementation strategy, not the public performance claim.

## Boundaries
**In scope:**
- NDArray class with full dtype system (data container only)
- NumPy-compatible functional API (creation, indexing, slicing, arithmetic, broadcasting)
- Linear algebra (dot, matmul, inv, solve, svd)
- Reductions (sum, mean, std, argmax)
- Pure functional-first design (`add(arr, 5)`, `pipe(arr, fn1, fn2)`)
- WASM acceleration for performance-critical operations
- Python parity benchmark contract and local evidence for performance claims

**Out of scope:**
- Sparse arrays
- File I/O
- Visualization
- Distributed execution
- GPU compute until it is admitted as a documented backend boundary

## SSOT References
- Dependencies: `package.json` (monorepo root plus `packages/numpy` and `packages/numpy-native`)
- Build config: `turbo.json`, `tsconfig.json`
- Linting: `biome.json`
- Package manager: Bun (see `packageManager` field)
