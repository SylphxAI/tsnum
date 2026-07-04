# ADL 0001: Python Parity Launch Contract

Status: active

## Context

`tsnum` is being repositioned as `@sylphx/numpy`: a NumPy-compatible
TypeScript numerical engine for Python users who want to move numerical and ML
workflows into a TypeScript stack without accepting JavaScript-only hot loops.

The public objective is commercial and ecosystem-facing:

- Python users should recognize the API immediately.
- TypeScript users should be able to train, simulate, analyze, and serve
  without a permanent Python sidecar when covered operations are enough.
- Public performance claims must be backed by same-machine Python/NumPy
  benchmark evidence.

This project should earn trust by being ambitious and measurable. It should not
earn stars by overstating parity before the release gate proves it.

## Public Names

| Boundary | Public name | Role |
| --- | --- | --- |
| NumPy-compatible numerical package | `@sylphx/numpy` | Primary public package contract for `np` syntax. |
| Native kernel package | `@sylphx/numpy-native` | Optional Rust/N-API native acceleration package. |
| GPU substrate | `@sylphx/webgpu` | Rust/wgpu backend substrate used by higher-level numerical libraries. |
| PyTorch-compatible ML engine | `@sylphx/torch` | Target public package direction for Axon, outside this repo. |

The repository name `tsnum` may remain as the GitHub history container, but
public package, README, npm, examples, and benchmark language should prefer
`@sylphx/numpy`.

## Claim Ladder

Public claims move through these gates in order:

1. **API direction**: examples and exported names intentionally follow NumPy
   spelling and semantics.
2. **Checksum parity**: covered benchmark operations match Python/NumPy
   checksums within configured tolerance.
3. **Covered-operation speed parity**: every covered row passes
   `bench:python-parity:enforce` at the configured slowdown threshold.
4. **Release readiness**: build, tests, enforced parity benchmark, release
   preflight, npm publish, npm registry readback, and consumer smoke all pass.
5. **Broad Python parity**: API coverage, dtype behavior, broadcasting,
   numerical edge cases, and backend coverage are large enough to support broad
   public ecosystem claims.

Only claims at or below the highest proven gate should appear in public
marketing copy.

## Current Evidence Snapshot

Latest accepted main evidence:

- GitHub Actions run: `28697134621`
- Commit: `9889114` (`bench: stabilize native dispatch matmul probe`)
- Platform: macOS arm64
- Python: 3.12.10
- NumPy: 2.5.0
- Bun: 1.3.14
- Backend: `native-blas`
- Checksum parity: pass for every covered row
- Speed target: maximum `1.05x` slowdown vs Python/NumPy

| Case | Speed vs NumPy | Status |
| --- | ---: | --- |
| `add_arrays_1m` | `0.69x` | pass |
| `add_scalar_1m` | `0.63x` | pass |
| `matmul_128` | `1.08x` | fail |
| `mean_1m` | `0.55x` | pass |
| `mul_scalar_1m` | `0.55x` | pass |
| `sum_1m` | `0.61x` | pass |
| `transpose_512` | `0.78x` | pass |

Current truthful public statement:

`@sylphx/numpy` has checksum parity on the covered benchmark set and passes the
speed target on six of seven covered rows in the latest accepted main CI
artifact. Full covered-operation speed parity is not claimed because
`matmul_128` remains over the `1.05x` release threshold.

## Native Dispatch Evidence

The same main run uploaded `native-dispatch-report`:

| Layer | Median ms |
| --- | ---: |
| `backend.typescript.matmul128` | `0.7513` |
| `backend.native-blas.matmul128` | `0.0959` |
| `public.matmul128` | `0.0976` |

This supports the current technical direction: native BLAS dispatch is
materially faster than the TypeScript fallback, and the public wrapper overhead
is small in the accepted main artifact. The remaining release blocker is the
same-machine NumPy comparison for `matmul_128`, not a missing native path.

## Negative Experiment Policy

Performance experiments must improve accepted benchmark evidence before they
merge.

Example: PR #45 (`perf: route matmul through native ffi wrapper`) exposed a C
ABI `dgemm` symbol and looked promising locally, but the rerun artifact
`28697320118` still failed `matmul_128` at `1.28x` slowdown and showed
`public.matmul128` at `0.2322ms`. That PR was closed instead of merged.

This is intentional. Benchmark-shaped changes that do not improve accepted
evidence should stay out of `main`, even when CI itself is green.

## Release Gate

The npm release path is blocked until these are true on the release runner:

```bash
bun install --frozen-lockfile
bun run build
bun run test
bun run bench:python-parity:enforce
bun run release:preflight
```

After publish, release completion also requires:

- npm registry readback for `@sylphx/numpy`;
- npm registry readback for required platform/native packages;
- at least one consumer install/import smoke;
- README/package metadata matching the published package name and version.

## Allowed Public Claims Today

- `@sylphx/numpy` is the public NumPy-compatible TypeScript package contract.
- The API target is Python/NumPy spelling and semantics.
- Covered benchmark checksums pass in the latest accepted main CI artifact.
- Six of seven covered speed rows pass the current `1.05x` NumPy comparison
  target in the latest accepted main CI artifact.
- Native BLAS materially improves covered matmul dispatch over the TypeScript
  fallback in the accepted native dispatch probe.

## Claims Not Allowed Yet

- Full NumPy API compatibility.
- Full PyTorch compatibility.
- Full covered-operation Python speed parity.
- Published npm availability for `@sylphx/numpy`.
- Any broad statement that TypeScript is already as fast as Python for all
  numerical or ML workloads.

## Next Launch Work

1. Close the `matmul_128` gap without weakening the `1.05x` release target.
2. Expand API compatibility tests around NumPy spelling, dtype behavior,
   broadcasting, shape semantics, and numerical edge cases.
3. Keep public docs tied to the latest accepted CI artifact.
4. Publish only after enforced parity, release preflight, npm readback, and
   consumer smoke pass.
