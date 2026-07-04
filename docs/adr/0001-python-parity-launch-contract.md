# ADR 0001: Python Parity Launch Contract

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
3. **Covered hot-loop speed parity**: every release row passes
   `bench:python-parity:enforce` at the configured slowdown threshold, while
   diagnostic rows remain published evidence without supporting launch speed
   claims.
4. **Release readiness**: build, tests, repeatable enforced parity benchmark,
   release preflight, npm publish, npm registry readback, and consumer smoke
   all pass.
5. **Broad Python parity**: API coverage, dtype behavior, broadcasting,
   numerical edge cases, and backend coverage are large enough to support broad
   public ecosystem claims.

Only claims at or below the highest proven gate should appear in public
marketing copy.

## Release vs Diagnostic Rows

Checksum parity is enforced for every benchmarked row. The release speed gate
applies to the covered hot-loop set: throughput-sized preallocated vector
`*_4m_out` rows, `matmul_128_out`, reductions, and transpose. Allocation-return
and short diagnostic rows remain published evidence and do not support launch
speed-parity claims until promoted to release rows by a later ADR/PR.

## Evidence Snapshot

Accepted evidence as of 2026-07-04. The latest uploaded CI artifacts are
canonical when this dated snapshot drifts.

- PR #76 run: `28705663337`
- Commit: `6435456` (`bench: measure parity in steady-state runtime samples`)
- Result: every covered row passed once, with checksum parity, on the pull
  request runner.
- Merged main run: `28705714377`
- Commit: `154a285` (`bench: measure parity in steady-state runtime samples`)
- Result: checksum parity passed, but speed parity failed on near-threshold
  rows after merge.
- Subsequent PR validation run: `28706160711`
- Result: required CI passed, but the non-enforcing `python-parity-report`
  failed `add_scalar_1m_out` at `1.16x`, reinforcing the repeatability blocker.
- Platform: macOS arm64
- Python: 3.12.10
- NumPy: 2.5.0
- Bun: 1.3.14
- Backend: `native-blas`
- Checksum parity: pass for every covered row in both runs
- Speed target: maximum `1.05x` slowdown vs Python/NumPy

PR #76 passing artifact:

| Case | Speed vs NumPy | Status |
| --- | ---: | --- |
| `add_arrays_1m` | `0.71x` | pass |
| `add_arrays_1m_out` | `0.99x` | pass |
| `add_scalar_1m` | `0.66x` | pass |
| `add_scalar_1m_out` | `0.98x` | pass |
| `matmul_128` | `0.93x` | pass |
| `mean_1m` | `0.53x` | pass |
| `mul_scalar_1m` | `0.59x` | pass |
| `mul_scalar_1m_out` | `0.90x` | pass |
| `sum_1m` | `0.53x` | pass |
| `transpose_512` | `0.67x` | pass |

Merged main artifact after the same code landed:

| Case | Speed vs NumPy | Status |
| --- | ---: | --- |
| `add_arrays_1m` | `0.71x` | pass |
| `add_arrays_1m_out` | `1.06x` | fail |
| `add_scalar_1m` | `0.66x` | pass |
| `add_scalar_1m_out` | `1.04x` | pass |
| `matmul_128` | `1.07x` | fail |
| `mean_1m` | `0.56x` | pass |
| `mul_scalar_1m` | `0.77x` | pass |
| `mul_scalar_1m_out` | `1.05x` | fail |
| `sum_1m` | `0.57x` | pass |
| `transpose_512` | `0.72x` | pass |

Current truthful public statement:

`@sylphx/numpy` has checksum parity on the covered benchmark set, and PR #76
proved that every then-covered row can pass the configured `1.05x` speed target
on the GitHub macOS runner. Merged main still shows near-threshold volatility in
allocation-return and small-matmul rows, so public launch speed claims are now
scoped to the enforced release hot-loop set. Allocation-return rows remain
diagnostic evidence until promoted by a later ADR/PR. Later non-enforcing CI
artifacts may fail different near-threshold rows
and must be treated as volatility evidence, not as public speed-parity proof.

## Native Dispatch Evidence

The merged main run uploaded `native-dispatch-report`:

| Layer | Median ms |
| --- | ---: |
| `public.addScalar.out` | `0.2210` |
| `public.addArrays.out` | `0.3911` |
| `public.mulScalar.out` | `0.2057` |
| `public.matmul128` | `0.0904` |
| `public.matmul128.out` | `0.0673` |

This supports the current technical direction: native-backed dispatch and
preallocated output buffers are the right hot-path shape. The release blocker is
the same-machine NumPy comparison for every enforced release row, plus checksum
parity for every benchmarked row, not merely the existence of a native path.

## Negative Experiment Policy

Performance experiments must improve accepted benchmark evidence before they
merge.

Example: PR #45 (`perf: route matmul through native ffi wrapper`) exposed a C
ABI `dgemm` symbol and looked promising locally, but the rerun artifact
`28697320118` still failed `matmul_128` at `1.28x` slowdown and showed
`public.matmul128` at `0.2322ms`. That PR was closed instead of merged.

Example: PR #59 (`perf: fast path native 1d out validation`) lowered
steady-state native dispatch overhead, but repeat CI artifacts did not support
merging: attempt 1 passed seven of ten rows and attempt 2 passed six of ten rows
against the strict `1.05x` target. That PR was closed instead of merged.

Example: PR #77 (`perf: widen native parity margin`) added aarch64 array-add
and native-buffer matmul allocation experiments, but CI artifact `28705817623`
regressed the release-blocking rows: `add_arrays_1m_out` at `1.10x`,
`matmul_128` at `1.21x`, and `mul_scalar_1m_out` at `1.08x`.

Example: PR #78 (`perf: route scalar out through vdsp`) improved
`mul_scalar_1m_out`, but CI artifact `28705919522` regressed
`add_scalar_1m_out` to `1.41x` and still failed `add_arrays_1m_out` and
`matmul_128`.

This is intentional. Benchmark-shaped changes that do not improve accepted
evidence should stay out of `main`, even when CI itself is green.

## Release Gate

The npm release path is blocked until these are true on the release runner:

```bash
bun install --frozen-lockfile
bun run build
bun run test
bun run bench:python-parity:repeatability
bun run release:preflight
```

`bench:python-parity:repeatability` runs the enforced benchmark three times by
default after two non-enforcing warmup comparisons and fails unless every
enforced attempt passes. Override the release proof count with
`PYTHON_PARITY_REPEAT_ATTEMPTS=5`; override warmups with
`PYTHON_PARITY_REPEAT_WARMUP_ATTEMPTS=2`.

The benchmark uses sample-level runtime isolation: each sample launches one
Python process and one Bun process, alternates runtime order, and measures all
covered cases with per-case setup and warmup inside that runtime. Single-case
debug runs still use `PYTHON_PARITY_CASE`. The speed threshold remains 1.05x and
checksum parity remains mandatory.

After publish, release completion also requires:

- npm registry readback for `@sylphx/numpy`;
- npm registry readback for required platform/native packages;
- at least one consumer install/import smoke;
- README/package metadata matching the published package name and version.

## Allowed Public Claims Today

- `@sylphx/numpy` is the public NumPy-compatible TypeScript package contract.
- The API target is Python/NumPy spelling and semantics.
- Covered benchmark checksums pass in the dated accepted main CI artifact.
- The recorded dated accepted main CI artifact lists current per-row speed
  evidence, and recent accepted main snapshots show output-buffer and
  small-matmul volatility outside the enforced hot-loop release claim.
- Native-backed public hot paths and preallocated output buffers are measured in
  the accepted native dispatch probe.

## Claims Not Allowed Yet

- Full NumPy API compatibility.
- Full PyTorch compatibility.
- Full covered-operation Python speed parity, including allocation-return
  diagnostic rows.
- Published npm availability for `@sylphx/numpy`.
- Any broad statement that TypeScript is already as fast as Python for all
  numerical or ML workloads.

## Next Launch Work

1. Close the output-buffer and small-matmul release-row repeatability gaps so
   `add_arrays_1m_out`, `add_scalar_1m_out`, `matmul_128_out`, and every
   near-threshold output-buffer row stay repeatably inside the `1.05x` release
   target.
2. Expand API compatibility tests around NumPy spelling, dtype behavior,
   broadcasting, shape semantics, and numerical edge cases.
3. Keep public docs tied to dated accepted CI artifacts and treat the latest
   uploaded artifacts as canonical.
4. Publish only after repeatable enforced parity, release preflight, npm
   readback, and consumer smoke pass.
