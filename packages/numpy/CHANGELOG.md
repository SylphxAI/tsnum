# @sylphx/numpy Changelog

## 0.0.0

Initial public package contract preparation.

- Renamed the public package contract from the historical `tsnum` codename to
  `@sylphx/numpy`.
- Kept the source repository name `SylphxAI/tsnum` as implementation history
  while moving public docs, imports, package metadata, and benchmark labels to
  `@sylphx/numpy`.
- Added Python parity benchmark evidence and generated CI report artifacts.
- Added Rust/N-API native float64 vector kernels through
  `@sylphx/numpy-native`.
- Kept npm publication blocked by `release:preflight` until
  `bench:python-parity:enforce` passes.

Full NumPy API coverage and all-operation Python speed parity are launch gates,
not completed claims.
