# tsnum

`tsnum` is an active foundation repository for a TypeScript numerical computing
library family. It owns the `tsnum` package API, TypeScript implementation,
native/WASM backend paths, benchmarks, tests, and package metadata for the
NumPy-compatible public direction.

## Lifecycle And Layer

- Lifecycle: `active`
- Layer: `foundation`

## Goals

- Provide a typed, functional-first numerical computing API for JavaScript and
  TypeScript consumers.
- Move the package family toward the `@sylphx/numpy` public contract with
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

This repository owns the tsnum package family and benchmarks. Consumers must
depend on documented package exports, not internal source paths or unreleased
backend assumptions. Product-specific numerical workflows belong in consuming
applications or separate adapter packages.

## Public Surfaces

- `README.md` and `packages/tsnum/README.md` document the library and API.
- `packages/tsnum/package.json` defines public package exports.
- `packages/tsnum/src/` contains the TypeScript implementation.
- `packages/tsnum/src/backend/` defines TypeScript and native backend behavior.
- `packages/tsnum-wasm/Cargo.toml` defines the WASM backend package.
- `packages/tsnum/PERFORMANCE.md` and `bench/python-parity/` document
  performance evidence.
- `package.json`, `turbo.json`, and `biome.json` define workspace commands and
  tool configuration.
- `.doctrine/project.json` is the machine-readable project manifest.

## Delivery

The repo-local GitHub Actions CI workflow runs install, build, tests, and the
Python parity benchmark on pull requests and `main` pushes. Package changes
still require local evidence plus CI evidence before merge.

Publishing is manually triggered through `.github/workflows/release.yml`, which
delegates to the central Sylphx release workflow and its `changesets/action`
versioning path. The release workflow runs `release:preflight` before publish,
and that preflight runs install, build, tests, and
`bench:python-parity:enforce`. Current speed gaps intentionally block
publication until the enforced benchmark passes. After publish, `release:readback`
must verify the npm registry version, and release evidence must include
provenance/attestation, changelog, and consumer smoke proof because source revert
alone does not undo a release.

The authoritative control-plane record is `.doctrine/project.json`.
