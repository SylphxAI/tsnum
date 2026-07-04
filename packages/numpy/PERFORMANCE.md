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

Recorded CI evidence after the Rust/N-API unrolled vector kernels and native
add-buffer dispatch path:

- Main CI run `28693587707` at `6c3d481` uploaded `python-parity-report`
  artifact `8077906004`; reporting mode passed checksum parity and all covered
  speed rows on macOS arm64 native BLAS.
- Main CI run `28693839561` at `c4d2f67` uploaded `python-parity-report`
  artifact `8077977328`; reporting mode passed checksum parity but failed
  `matmul_128` and transpose speed rows.
- PR #28 run `28693698365` uploaded `python-parity-report` artifact
  `8077937938`; enforced mode still failed add arrays, `matmul_128`, and
  transpose while checksum parity passed.
- Main CI run `28694558172` at `e2d79cb` uploaded `python-parity-report`;
  reporting mode passed checksum parity but failed `transpose_512` at the
  configured 1.05x speed target.
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
It is useful for optimization triage, but it is not release evidence by itself:
publish readiness still depends on `bench:python-parity:enforce`.

## Backend Evidence

- TypeScript backend: always-available reference implementation and fallback.
- Native kernel package: `@sylphx/numpy-native` provides Rust/N-API float64
  vector kernels and a macOS Accelerate matmul bridge for the NumPy-compatible
  package path.
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
  output overhead, BLAS dispatch overhead, and transpose variance on the release
  runner.
- Promote only optimizations that improve the Python parity gate or are backed
  by the native dispatch probe; negative microbench experiments should not
  become public API.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the enforced
  parity benchmark passes.
