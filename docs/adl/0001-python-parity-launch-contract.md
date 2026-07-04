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

## Evidence Snapshot

Accepted main evidence as of 2026-07-04. The latest uploaded CI artifacts are
canonical when this dated snapshot drifts.

- GitHub Actions run: `28699887631`
- Commit: `436637f` (`docs: sync parity evidence after out validation`)
- Platform: macOS arm64
- Python: 3.12.10
- NumPy: 2.5.0
- Bun: 1.3.14
- Backend: `native-blas`
- Checksum parity: pass for every covered row
- Speed target: maximum `1.05x` slowdown vs Python/NumPy

| Case | Speed vs NumPy | Status |
| --- | ---: | --- |
| `add_arrays_1m` | `0.71x` | pass |
| `add_arrays_1m_out` | `1.06x` | fail |
| `add_scalar_1m` | `0.65x` | pass |
| `add_scalar_1m_out` | `1.04x` | pass |
| `matmul_128` | `1.11x` | fail |
| `mean_1m` | `0.56x` | pass |
| `mul_scalar_1m` | `0.64x` | pass |
| `mul_scalar_1m_out` | `1.06x` | fail |
| `sum_1m` | `0.57x` | pass |
| `transpose_512` | `0.73x` | pass |

Current truthful public statement:

`@sylphx/numpy` has checksum parity on the covered benchmark set and passes the
speed target on seven of ten covered rows in the dated accepted main CI
artifact. Full covered-operation speed parity is not claimed because
`add_arrays_1m_out`, `matmul_128`, and `mul_scalar_1m_out` remain over the
`1.05x` release threshold.

## Native Dispatch Evidence

The same main run uploaded `native-dispatch-report`:

| Layer | Median ms |
| --- | ---: |
| `public.addScalar.out` | `0.1888` |
| `public.addArrays.out` | `0.3409` |
| `public.mulScalar.out` | `0.1895` |
| `public.matmul128` | `0.0835` |
| `public.matmul128.out` | `0.0797` |

This supports the current technical direction: native-backed dispatch and
preallocated output buffers are the right hot-path shape. The remaining release
blocker is the same-machine NumPy comparison for every covered row, not merely
the existence of a native path.

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
- Covered benchmark checksums pass in the dated accepted main CI artifact.
- Seven of ten covered speed rows pass the current `1.05x` NumPy comparison
  target in the dated accepted main CI artifact.
- Native-backed public hot paths and preallocated output buffers are measured in
  the accepted native dispatch probe.

## Claims Not Allowed Yet

- Full NumPy API compatibility.
- Full PyTorch compatibility.
- Full covered-operation Python speed parity.
- Published npm availability for `@sylphx/numpy`.
- Any broad statement that TypeScript is already as fast as Python for all
  numerical or ML workloads.

## Next Launch Work

1. Close the `add_arrays_1m_out`, `matmul_128`, and `mul_scalar_1m_out` gaps
   without weakening the `1.05x` release target.
2. Expand API compatibility tests around NumPy spelling, dtype behavior,
   broadcasting, shape semantics, and numerical edge cases.
3. Keep public docs tied to dated accepted CI artifacts and treat the latest
   uploaded artifacts as canonical.
4. Publish only after enforced parity, release preflight, npm readback, and
   consumer smoke pass.
