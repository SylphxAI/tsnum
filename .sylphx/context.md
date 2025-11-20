# Project Context

## What (Internal)
TypeScript NumPy alternative (tsnum): High-performance n-dimensional array library for TypeScript/JavaScript with WASM acceleration.

**Scope:**
- NumPy-like API for TypeScript
- Pure TS core + optional WASM acceleration
- Tree-shakeable functional API
- Browser + Node.js support

**Target:** TypeScript developers needing NumPy functionality without Python

**Out of scope (v1.0):**
- GPU acceleration (WebGL/WebGPU)
- Sparse arrays
- File I/O (CSV, NPY)
- Plotting/visualization

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
- Pure TS: competitive with lodash/ramda array operations
- WASM: within 10-20% of NumPy for matrix operations
- Threshold-based auto-selection (small arrays → TS, large → WASM)

## Boundaries
**In scope:**
- NDArray class with full dtype system
- NumPy-compatible API (creation, indexing, slicing, arithmetic, broadcasting)
- Linear algebra (dot, matmul, inv, solve, svd)
- Reductions (sum, mean, std, argmax)
- Both OOP (`arr.add()`) and functional (`add(arr)`) APIs
- WASM acceleration for performance-critical operations

**Out of scope:**
- Complex numbers (future)
- Advanced FFT (future)
- File I/O
- Visualization
- GPU compute

## SSOT References
- Dependencies: `package.json` (monorepo root + packages/tsnum)
- Build config: `turbo.json`, `tsconfig.json`
- Linting: `biome.json`
- Package manager: Bun (see `packageManager` field)
