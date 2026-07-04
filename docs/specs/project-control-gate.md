# Project Control Gate

## Purpose

Make `tsnum` dogfood GroundAtlas as a vendor-neutral project-control consumer while preserving the repository's stricter numerical-release boundary.

## Truth Boundary

- `project.manifest.json` is the vendor-neutral GroundAtlas control file.
- `.doctrine/project.json` is the Sylphx Doctrine adapter and org-local governance catalog.
- Generated `.groundatlas*` and `.groundatlas-pilot/**` files are evidence/navigation only, not source of truth.
- `docs/adr/0001-python-parity-launch-contract.md`, `README.md`, `packages/numpy/README.md`, and `bench/python-parity/results/latest.*` own the NumPy parity launch evidence.

## Files Agents Must Read Before Adoption Changes

1. `AGENTS.md`
2. `PROJECT.md`
3. `project.manifest.json`
4. `.doctrine/project.json`
5. `README.md` and `packages/numpy/README.md`
6. `docs/adr/0001-python-parity-launch-contract.md`
7. `bench/python-parity/README.md` and generated parity reports
8. `.github/workflows/ci.yml` and `.github/workflows/release.yml`
9. `package.json`, `turbo.json`, `biome.json`, package manifests, source, tests, and benchmarks touched by the change

## CI Contract

Pull requests, merge groups, and main pushes must:

- install with `bun install --frozen-lockfile`;
- build with `bun run build`;
- test with `bun run test`;
- run the Python parity benchmark and report freshness check;
- run the project-control boundary test;
- run `SylphxAI/groundatlas@v0.1.2` with `package-spec: groundatlas@0.1.2`, `require-atlas: true`, and `strict: true`;
- assert that GroundAtlas selects `project.manifest.json` and keeps `.doctrine/project.json` as an adapter;
- upload GroundAtlas reports as CI artifacts.

## Release Boundary

GroundAtlas adoption does not make `@sylphx/numpy` publishable. Public npm publication remains intentionally blocked until the release preflight parity gate passes repeatably. Current npm readback for `@sylphx/numpy`, `@sylphx/numpy-native`, and `@sylphx/numpy-wasm` is E404; that is expected until the parity-gated release path succeeds.
