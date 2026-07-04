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

Latest main CI evidence after the Rust/N-API unrolled vector kernels and native
add-buffer dispatch path:

- CI run `28693429159` at `0187bbc` uploaded `python-parity-report` artifact
  `8077861115`.
- Checksum parity passes for all covered benchmark cases.
- 6 of 7 covered speed rows pass the 1.05x target on macOS arm64 native BLAS:
  add arrays, add scalar, multiply scalar, sum, mean, and transpose.
- `matmul_128` remains above the speed target in that artifact, so
  `bench:python-parity:enforce` and release preflight are still expected to
  block publication until the matrix path closes.
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
2. Native-backed reductions, transpose, and Rust/N-API vector kernels now pass
   the covered CI speed rows; small-matrix matmul remains the blocker.
3. The benchmark compares identical inputs and records Python and
   `@sylphx/numpy` checksums to guard against fast-but-wrong kernels.
4. macOS native acceleration depends on Bun FFI and Accelerate; unsupported
   platforms fall back to other backends.

## Future Optimizations (Roadmap)

- Close the remaining small-matrix matmul speed gap against NumPy by reducing
  BLAS dispatch overhead or moving that path behind a faster native kernel.
- Promote only optimizations that improve the Python parity gate or are backed
  by the native dispatch probe; negative microbench experiments should not
  become public API.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the enforced
  parity benchmark passes.
