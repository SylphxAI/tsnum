# 005. Python Parity Performance Contract

**Status:** Accepted
**Date:** 2026-07-03

## Context

tsnum is valuable only if JavaScript and TypeScript consumers can get NumPy-class
behavior without giving up NumPy-class speed. The previous target allowed WASM to
be within 10-20% of NumPy for matrix operations. That is not strong enough for
the current product direction: the library should aim for Python-compatible
syntax, Python-compatible function behavior, and Python-equivalent performance.

The repository also owns its benchmark evidence. Performance claims cannot live
only in README prose or one-off local measurements.

## Decision

Adopt Python/NumPy parity as an admission contract:

- NumPy is the canonical Python reference for tsnum API semantics.
- Public function names, argument order, default behavior, dtype behavior, shape
  behavior, broadcasting, and error behavior should match NumPy unless a
  documented TypeScript/runtime constraint makes exact compatibility impossible.
- Unpublished or unused syntax may be redesigned, renamed, or removed to match
  NumPy more closely.
- Performance parity means tsnum wall time is no slower than 1.05x NumPy wall
  time for the same operation, input shape, dtype, warmup policy, and hardware.
- A performance claim is admissible only when it is backed by the repository
  benchmark harness.
- Default benchmark runs report current state. Enforcement runs fail if any
  covered operation exceeds the parity threshold.

The initial parity suite covers the hot operations that determine whether the
direction is viable:

- `add` scalar, same-shape `add`, scalar `mul`
- `sum` and `mean`
- materialized `transpose`
- `matmul`

This is the first gate, not the full compatibility matrix. New operations should
enter the parity suite before they are described as Python-equivalent.

## Rationale

- Users will not switch from Python if TypeScript is materially slower for the
  same numerical primitive.
- A numeric library needs reproducible performance evidence, not benchmark
  narratives tied to one developer machine.
- Keeping NumPy as the syntax and behavior reference avoids a separate tsnum-only
  API dialect.
- The 1.05x threshold is strict enough to mean "same speed" in product language
  while allowing normal measurement noise.

## Consequences

**Positive:**

- Performance parity becomes machine-checkable.
- API redesign decisions have a single compatibility target.
- Release and README claims can cite benchmark evidence.

**Negative:**

- Current implementation may fail the enforcement gate until backend and API work
  catch up.
- Some TypeScript-friendly aliases may become secondary or be removed before
  publish.
- Full NumPy parity requires broader dtype, broadcasting, indexing, and error
  compatibility tests beyond this first benchmark slice.

## Validation

Run:

```bash
bun run bench:python-parity
bun run bench:python-parity:enforce
```

`bench:python-parity` records the current ratio. `bench:python-parity:enforce`
is the admission gate for parity claims.

On Bun/macOS the benchmark attempts `initNativeBLAS()` before measuring. Native
BLAS is the admitted path for Python-class matrix and vector performance; the
TypeScript backend remains the portable fallback.

## References

- Benchmark runner: `bench/python-parity/compare.ts`
- Python baseline: `bench/python-parity/python_bench.py`
- tsnum baseline: `bench/python-parity/ts_bench.ts`
- Native BLAS backend: `packages/numpy/src/backend/native-blas.ts`
- Project context: `.sylphx/context.md`
