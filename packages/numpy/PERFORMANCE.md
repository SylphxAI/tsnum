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

Latest local evidence after the Rust/N-API native vector path and scalar-add
dispatch cleanup:

- Checksum parity passes for all covered benchmark cases.
- Native-backed reductions pass the speed target in current local runs.
- Rust/N-API buffer kernels reduce the output-producing vector gap, but
  add/mul/matmul/transpose are still not consistently under the 1.05x target in
  enforced local benchmark runs.
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
It is useful for optimization triage, but it is not release evidence by itself:
publish readiness still depends on `bench:python-parity:enforce`.

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
2. Native-backed reductions and Rust/N-API vector kernels reduce the measured
   gap, but full covered-operation speed parity is not complete.
3. The benchmark compares identical inputs and records Python and
   `@sylphx/numpy` checksums to guard against fast-but-wrong kernels.
4. macOS native acceleration depends on Bun FFI and Accelerate; unsupported
   platforms fall back to other backends.

## Future Optimizations (Roadmap)

- Close the remaining add/mul/matmul/transpose speed gaps against NumPy by
  reducing output allocation, N-API wrapper, and small-matrix dispatch overhead.
- Promote only optimizations that improve the Python parity gate or are backed
  by the native dispatch probe; negative microbench experiments should not
  become public API.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the enforced
  parity benchmark passes.
