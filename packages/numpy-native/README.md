# @sylphx/numpy-native

Rust/N-API native tensor kernels for the SylphxAI NumPy-compatible TypeScript
stack.

This package is a backend component, not the public NumPy API. The public API
target remains `@sylphx/numpy`; this package owns low-level float64 hot
kernels that let the TypeScript API move toward Python-class performance without
putting numerical loops in JavaScript.

## Current Scope

- `addScalarF64`, `mulScalarF64`, and `addF64` allocate and return Float64Array
  outputs.
- `addScalarF64Buffers`, `mulScalarF64Buffers`, and `addF64Buffers` write into
  caller-owned Buffer views over Float64Array memory for lower hot-path overhead.
- The package is loaded opportunistically by the `@sylphx/numpy` native backend
  and falls back to native BLAS/TypeScript paths when unavailable.

## Boundary

Performance claims must come from `bench/python-parity`, not isolated native
microbenchmarks. This package is evidence that Python-class speed is technically
possible from TypeScript, but the full benchmark gate is not complete yet.
