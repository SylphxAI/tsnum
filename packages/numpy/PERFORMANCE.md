# Performance Evidence

Performance claims for `@sylphx/numpy` are admitted by repository-local
benchmarks. The primary public benchmark is the Python parity suite in
`bench/python-parity`, which compares `@sylphx/numpy` against Python/NumPy on
the same machine and always enforces checksum parity for covered operations.

## Bundle Size

- **Total gzipped**: ~6.8KB (well under 20KB target)
- **Uncompressed**: ~42.5KB
- **Tree-shakeable**: Import only what you need

### Per-module gzipped sizes:
```
creation.js:       1.4KB
ndarray.js:        840 bytes
core/utils.js:     884 bytes
ops/arithmetic.js: 599 bytes
ops/shape.js:      595 bytes
ops/comparison.js: 586 bytes
ops/reductions.js: 480 bytes
functional.js:     234 bytes
```

## Python Parity Benchmark

Run from the repository root:

```bash
bun run bench:python-parity
bun run bench:python-parity:enforce
bun run bench:python-parity:report:check
bun run bench:native-dispatch
```

Default runs print and save current ratios. Enforced runs fail when a covered
operation is slower than NumPy by more than the configured threshold. Checksum
parity is always enforced. Each run writes JSON and Markdown evidence under
`bench/python-parity/results/`; CI checks the generated Markdown report and
uploads both files as the `python-parity-report` artifact.

The comparison harness runs paired Python and `@sylphx/numpy` samples with
alternating runtime order, records the exact Python and TS commands, and reports
raw samples plus median, p95, and relative standard deviation for every row.
That evidence separates true backend gaps from process-order or runner variance
without relaxing the checksum or speed gates.

Recent main CI evidence:

- Main CI run `28697134621` on macOS arm64 uploaded `python-parity-report`.
- Commit: `9889114` (`bench: stabilize native dispatch matmul probe`).
- Runtime: Python 3.12.10, NumPy 2.5.0, Bun 1.3.14,
  `@sylphx/numpy` backend `native-blas`.
- Checksum parity passed for every covered row.
- Speed rows passed for `add_arrays_1m` (`0.69x`), `add_scalar_1m` (`0.63x`),
  `mean_1m` (`0.55x`), `mul_scalar_1m` (`0.55x`), `sum_1m` (`0.61x`), and
  `transpose_512` (`0.78x`).
- `matmul_128` failed the 1.05x speed target at `1.08x` slowdown, with paired
  slowdown p95 at `1.25x`.
- The same run's native dispatch artifact measured `public.matmul128` at
  `0.0976ms`, `backend.native-blas.matmul128` at `0.0959ms`, and
  `backend.typescript.matmul128` at `0.7513ms`, which supports the native BLAS
  direction while keeping the same-machine NumPy comparison as the release
  blocker.
- Full speed parity is therefore not claimed.
- PR #36's native-addon Accelerate matmul bridge regressed `matmul_128` to
  `1.50x` on main CI run `28695093346`; PR #37 reverted that path and restored
  the column-major native BLAS route.
- PR #45's direct C ABI dgemm wrapper was closed after rerun `28697320118`
  failed `matmul_128` at `1.28x` and measured `public.matmul128` at
  `0.2322ms`; negative performance experiments should not become public API.
- `bench:python-parity:enforce` and release preflight remain publication
  blockers until covered-operation speed parity is repeatable.
- Current JSON output is written to `bench/python-parity/results/latest.json`.
- Current Markdown output is written to `bench/python-parity/results/latest.md`.

## Native Dispatch Probe

`bun run bench:native-dispatch` is the diagnostic benchmark used before backend
dispatch changes. It measures the same float64 vector operations at four
layers:

- native N-API kernels;
- TypeScript backend;
- NativeBLAS backend;
- public `@sylphx/numpy` API.

The probe writes ignored local reports under `bench/python-parity/results/` and
separates kernel speed from output allocation, wrapper, and public API overhead.
CI uploads the same files as the `native-dispatch-report` artifact. It is useful
for optimization triage, but it is not release evidence by itself: publish
readiness still depends on `bench:python-parity:enforce`.

The `matmul128` probe rows use the same default sample count, warmup, and
iteration count as the Python parity benchmark so the CI artifact can separate
small-matrix native overhead from runner noise.

## Backend Evidence

- TypeScript backend: always-available reference implementation and fallback.
- Native kernel package: `@sylphx/numpy-native` provides Rust/N-API float64
  vector kernels for the NumPy-compatible package path.
- Native BLAS backend: Bun/macOS Accelerate path for covered float64 reductions,
  matrix operations, and fallback kernels.
- WASM backend: portable acceleration path for supported operations.

## Performance Notes

1. Public speed claims must cite the Python parity benchmark, not isolated local
   microbenchmarks.
2. Native-backed reductions and Rust/N-API vector kernels are strong, but
   release proof requires the full covered benchmark set to pass repeatably.
3. The benchmark compares identical inputs and records Python and
   `@sylphx/numpy` checksums to guard against fast-but-wrong kernels.
4. macOS native acceleration depends on Bun FFI and Accelerate; unsupported
   platforms fall back to other backends.

## Future Optimizations (Roadmap)

- Close the remaining enforced-gate gaps against NumPy by reducing vector
  output overhead, BLAS dispatch overhead, and `matmul_128` runner variance on
  the release runner.
- Promote only optimizations that improve the Python parity gate or are backed
  by the native dispatch probe; negative microbench experiments should not
  become public API.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the enforced
  parity benchmark passes.
