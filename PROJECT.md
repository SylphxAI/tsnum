# tsnum

`tsnum` is an active foundation repository for a TypeScript numerical computing
library family. It owns the `@sylphx/numpy` public package API, TypeScript
implementation, native/WASM backend paths, benchmarks, tests, and package
metadata for the NumPy-compatible public direction. `tsnum` remains the
repository name and implementation history; `@sylphx/numpy` is the public npm
package contract.

## Lifecycle And Layer

- Lifecycle: `active`
- Layer: `foundation`

## Goals

- Provide a typed, functional-first numerical computing API for JavaScript and
  TypeScript consumers.
- Maintain the package family around the `@sylphx/numpy` public contract with
  NumPy-compatible spelling, array semantics, and explicit backend boundaries.
- Keep TypeScript, native, and WASM backend behavior coherent through package
  exports, tests, and benchmarks.
- Publish only documented package exports and performance claims that can be
  reproduced by repository-local evidence.

## Non-Goals

- Own NumPy upstream behavior, scientific correctness beyond the documented
  package contract, or downstream application modeling decisions.
- Own consumer product numerical policy, visualization, storage, or UI behavior.
- Publish enterprise doctrine, org rulesets, or shared CI/release policy.

## Boundaries

This repository owns the `@sylphx/numpy` package family and benchmarks.
Consumers must depend on documented package exports, not internal source paths
or unreleased backend assumptions. Product-specific numerical workflows belong
in consuming applications or separate adapter packages.

## Public Surfaces

- `README.md` and `packages/numpy/README.md` document the library and API.
- `packages/numpy/package.json` defines the `@sylphx/numpy` public package
  exports.
- `packages/numpy-native/package.json` defines the Rust/N-API native kernel
  package used by the NumPy-compatible backend path.
- `packages/numpy/src/` contains the TypeScript implementation.
- `packages/numpy/src/backend/` defines TypeScript and native backend behavior.
- `packages/numpy-wasm/Cargo.toml` defines the WASM backend package.
- `packages/numpy/PERFORMANCE.md` and `bench/python-parity/` document
  performance evidence.
- `package.json`, `turbo.json`, and `biome.json` define workspace commands and
  tool configuration.
- `project.manifest.json` is the vendor-neutral GroundAtlas project-control manifest.
- `.doctrine/project.json` is the Sylphx Doctrine adapter and org-local governance catalog.

## Delivery

The repo-local GitHub Actions CI workflow runs install, build, tests, the
Python parity benchmark, project-control tests, and GroundAtlas package dogfooding on pull requests and `main` pushes. The benchmark writes
JSON and Markdown evidence under `bench/python-parity/results/`; CI checks the
Markdown report freshness and uploads both files as the `python-parity-report`
artifact. Package changes still require local evidence plus CI evidence before
merge.

Publishing is manually triggered through `.github/workflows/release.yml`. The
repo-local release workflow first runs `release:preflight` on macOS so the
Python parity gate uses the native BLAS backend it is designed to validate.
Only after that preflight passes does the workflow delegate to the central
Sylphx release workflow and its `changesets/action` versioning/publishing path.
The central publish job still builds the workspace before publishing, and
postpublish runs `release:readback`.

`release:preflight` runs install, build, tests, and
`bench:python-parity:repeatability`. PR #76 proved one all-row passing covered
speed artifact, but merged main showed near-threshold volatility. The release
gate now separates enforced hot-loop release rows from diagnostic
allocation-return and short rows; publication remains intentionally blocked
until every enforced release row passes repeatably and every benchmarked row
keeps checksum parity on the release preflight runner. After publish,
`release:readback` must
verify every public workspace package, and release evidence must include
provenance/attestation, changelog, and consumer smoke proof because source
revert alone does not undo a release.

The first `@sylphx/numpy` npm publication is not complete yet. Public docs may
show the final package contract, but release status must continue to say that
registry installation is pending the parity-gated release.

The authoritative control-plane record is `.doctrine/project.json`.

Generated `.groundatlas*` reports are evidence/navigation only, not source of truth.
