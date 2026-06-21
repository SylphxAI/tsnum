# tsnum

`tsnum` is an active foundation repository for a TypeScript numerical computing
library family. It owns the `tsnum` package API, TypeScript implementation,
WASM backend package, benchmarks, tests, and package metadata for NumPy-inspired
array, math, statistics, FFT, random, and linear-algebra operations.

## Lifecycle And Layer

- Lifecycle: `active`
- Layer: `foundation`

## Goals

- Provide a typed, functional-first numerical computing API for JavaScript and
  TypeScript consumers.
- Keep TypeScript and WASM backend behavior coherent through package exports,
  tests, and benchmarks.
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
- `packages/tsnum-wasm/Cargo.toml` defines the WASM backend package.
- `PERFORMANCE.md` and benchmark scripts document performance evidence.
- `package.json`, `turbo.json`, and `biome.json` define workspace commands and
  tool configuration.
- `.doctrine/project.json` is the machine-readable project manifest.

## Delivery

No repo-local CI workflow is currently declared. Package changes must be proved
with local build, lint, typecheck, test, and benchmark evidence until central
admission is added. Published package changes require package readback or
consumer smoke evidence because source revert alone does not undo a release.

The authoritative control-plane record is `.doctrine/project.json`.
