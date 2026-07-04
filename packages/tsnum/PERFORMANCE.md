# Performance Evidence

Performance claims for tsnum are admitted by repository-local benchmarks. The
primary public benchmark is the Python parity suite in `bench/python-parity`,
which compares tsnum against Python/NumPy on the same machine and always
enforces checksum parity for covered operations.

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
```

Default runs print and save current ratios. Enforced runs fail when a covered
operation is slower than NumPy by more than the configured threshold. Checksum
parity is always enforced. Each run writes JSON and Markdown evidence under
`bench/python-parity/results/`; CI checks the generated Markdown report and
uploads both files as the `python-parity-report` artifact.

Latest local evidence after the Rust/N-API native vector path:

- Checksum parity passes for all covered benchmark cases.
- Rust/N-API buffer kernels reduce the output-producing vector gap; reductions
  pass the speed target, while add/mul/matmul and transpose are still not
  consistently under the 1.05x target in local benchmark runs.
- Current JSON output is written to `bench/python-parity/results/latest.json`.
- Current Markdown output is written to `bench/python-parity/results/latest.md`.

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
3. The benchmark compares identical inputs and records Python and tsnum
   checksums to guard against fast-but-wrong kernels.
4. macOS native acceleration depends on Bun FFI and Accelerate; unsupported
   platforms fall back to other backends.

## Future Optimizations (Roadmap)

- Close the remaining add/mul/matmul/transpose speed gaps against NumPy by
  reducing output allocation, N-API wrapper, and small-matrix dispatch overhead.
- Prove the release workflow with a successful package publish, npm registry
  readback, changelog evidence, and consumer smoke evidence after the enforced
  parity benchmark passes.
