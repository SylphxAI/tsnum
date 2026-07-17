# Project control gate

Make `tsnum` keep explicit project-control metadata and release boundaries
**without** GroundAtlas package dogfood (Control Plane ADR-0014).

## Rules

- `project.manifest.json` is optional vendor-neutral project metadata — not a scanner product requirement.
- `.doctrine/project.json` remains the Sylphx adapter / local governance catalog during doctrine→skills migration.
- CI must run `test/project-control.node-test.mjs`.
- CI must **not** pin `SylphxAI/groundatlas@*` or `package-spec: groundatlas@*`.
- Repository intelligence for the fleet is Control Plane Repository Ingestion, not per-repo CLI maps.

## Release boundary

GroundAtlas adoption never made `@sylphx/numpy` publishable. Public npm publication remains intentionally blocked until the release preflight parity gate passes. Current npm readback for `@sylphx/numpy`, `@sylphx/numpy-native`, and `@sylphx/numpy-wasm` is E404; that is expected until the parity-gated release path succeeds.
