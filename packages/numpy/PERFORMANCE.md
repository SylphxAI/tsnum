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
bun run bench:python-parity:repeatability
bun run bench:python-parity:report:check
bun run bench:native-dispatch
```

Default runs print and save current ratios. Enforced runs fail when a release
row is slower than NumPy by more than the configured threshold. Diagnostic rows
are still reported and checksum-checked, but they do not support launch
speed-parity claims until promoted to release rows. Checksum parity is always
enforced for every benchmarked row. Each run writes JSON and Markdown evidence
under `bench/python-parity/results/`; CI checks the generated Markdown report
and uploads both files as the `python-parity-report` artifact.

The comparison harness runs paired Python and `@sylphx/numpy` samples with
alternating runtime order, records the exact Python and TS commands, and reports
raw samples plus median, p95, and relative standard deviation for every row.
Each sample uses one Python process and one Bun process, while cases keep
per-case setup, warmup, and timed iterations inside that runtime. That measures
steady-state library performance for numerical loops, separates true backend
gaps from process-order or runner variance, and does not relax the checksum or
speed gates.

The release path uses `bench:python-parity:repeatability`, which runs the
comparison twice as a non-enforcing warmup, then runs the enforced benchmark
multiple times. Checksum parity must hold on every attempt, each release row may
have at most one speed outlier, each release row median slowdown across attempts
must stay inside the configured target, and no release-row outlier may exceed
the configured cap. This turns repeatability into a release gate rather than a
README promise.

Recent accepted evidence as of 2026-07-04. The cited passing artifact is a
historical best snapshot, not a release claim. Newer uploaded
`python-parity-report` and `native-dispatch-report` artifacts remain canonical
for current status when this dated snapshot drifts.

- PR #76 CI run `28705663337` on macOS arm64 uploaded a passing
  `python-parity-report`.
- Commit: `6435456` (`bench: measure parity in steady-state runtime samples`).
- Runtime: Python 3.12.10, NumPy 2.5.0, Bun 1.3.14,
  `@sylphx/numpy` backend `native-blas`.
- Checksum parity passed for every covered row.
- Speed rows passed for every covered case in that PR artifact:
  `add_arrays_1m` (`0.71x`), `add_arrays_1m_out` (`0.99x`),
  `add_scalar_1m` (`0.66x`), `add_scalar_1m_out` (`0.98x`), `matmul_128`
  (`0.93x`), `mean_1m` (`0.53x`), `mul_scalar_1m` (`0.59x`),
  `mul_scalar_1m_out` (`0.90x`), `sum_1m` (`0.53x`), and `transpose_512`
  (`0.67x`).
- Merged main run `28705714377` on commit `154a285` still failed
  near-threshold rows: `add_arrays_1m_out` (`1.06x`), `matmul_128` (`1.07x`),
  and `mul_scalar_1m_out` (`1.05x`).
- Subsequent PR validation run `28706160711` kept required CI green but
  uploaded a non-enforcing report with `add_scalar_1m_out` at `1.16x`, proving
  the covered speed target is still not repeatable enough for publication.
- The merged main native dispatch artifact measured `public.addScalar.out` at
  `0.2210ms`, `public.addArrays.out` at `0.3911ms`, `public.mulScalar.out` at
  `0.2057ms`, `public.matmul128` at `0.0904ms`, and `public.matmul128.out` at
  `0.0673ms`, which supports the native output-buffer direction while keeping
  the same-machine NumPy comparison as the release blocker.
- Full speed parity is therefore not claimed yet: release readiness depends on
  repeatability, not a single favorable artifact.
- PR #36's native-addon Accelerate matmul bridge regressed `matmul_128` to
  `1.50x` on main CI run `28695093346`; PR #37 reverted that path and restored
  the column-major native BLAS route.
- PR #45's direct C ABI dgemm wrapper was closed after rerun `28697320118`
  failed `matmul_128` at `1.28x` and measured `public.matmul128` at
  `0.2322ms`; negative performance experiments should not become public API.
- PR #59's native 1D `out` validation fast path was closed after repeat CI
  artifacts did not support merging: attempt 1 was 7/10 and attempt 2 was 6/10
  against the 1.05x speed target, despite lower steady-state dispatch overhead.
- PR #77's aarch64 array-add and native-buffer matmul allocation experiment was
  closed because CI artifact `28705817623` regressed release-blocking rows:
  `add_arrays_1m_out` (`1.10x`), `matmul_128` (`1.21x`), and
  `mul_scalar_1m_out` (`1.08x`).
- PR #78's scalar vDSP output-routing experiment was closed because CI artifact
  `28705919522` regressed `add_scalar_1m_out` to `1.41x` and still failed
  `add_arrays_1m_out` and `matmul_128`.
- `bench:python-parity:repeatability` and release preflight remain publication
  blockers until enforced release-row speed parity is repeatable and every
  benchmarked row keeps checksum parity across the expanded row set.
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
readiness still depends on `bench:python-parity:repeatability`.

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
   release proof requires the enforced release row set to pass repeatably while
   every benchmarked row keeps checksum parity.
3. The benchmark compares identical inputs and records Python and
   `@sylphx/numpy` checksums to guard against fast-but-wrong kernels.
4. macOS native acceleration depends on Bun FFI and Accelerate; unsupported
   platforms fall back to other backends.

## Future Optimizations (Roadmap)

- Close the remaining enforced-gate volatility against NumPy by reducing
  output-buffer wrapper overhead and proving that `add_scalar_1m_out`,
  `matmul_128_out`, and `mul_scalar_1m_out` stay repeatably inside the 1.05x
  gate on the release runner. Allocation-return and short rows remain
  diagnostic until their speed is repeatable enough to promote.
- Promote only optimizations that improve the Python parity gate or are backed
  by the native dispatch probe; negative microbench experiments should not
  become public API.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the
  repeatable enforced parity benchmark passes.
