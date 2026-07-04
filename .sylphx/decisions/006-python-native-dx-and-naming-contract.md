# 006. Python-Native DX And Naming Contract

**Status:** Accepted
**Date:** 2026-07-03

## Context

The product goal is not a novel TypeScript numerical API. The goal is to rebuild
the Python numerical engine in TypeScript so Python users can move code and
habits across with the least possible translation cost.

Literal Python syntax cannot always exist inside TypeScript syntax. TypeScript
does not support Python slicing syntax (`x[:, 0]`) or numeric operator
overloading (`a + b`, `a @ b`) for user-defined arrays. The product contract is
therefore Python API compatibility plus deterministic TypeScript grammar
adapters, not an invented API dialect.

## Decision

tsnum becomes the implementation codename for the NumPy-compatible package.

Commercial objective:

- The public positioning is `NumPy for TypeScript`: a migration path for Python
  numerical users who want TypeScript-native application, agent, and server
  workflows.
- README and package-page copy should be bold about the mission but precise
  about evidence. It may claim a NumPy-compatible target, native-backed
  execution path, and benchmark gate. It must not claim full NumPy parity or
  all-op Python-speed equivalence until the parity gate proves it.
- Star-growth and adoption work should optimize for first-viewport clarity:
  Python users must understand the package purpose, import alias, performance
  contract, and rename direction without reading internal docs.

Target public DX:

```ts
import * as np from '@sylphx/numpy'

const x = np.array([1, 2, 3])
const y = np.add(x, 5)
const z = np.matmul(a, b)
```

Naming contract:

- Product/page name: `NumPy for TypeScript`.
- Preferred package target: `@sylphx/numpy`.
- Preferred import alias: `np`.
- Fallback package target, only if legal/trademark review blocks the preferred
  package name: `@sylphx/np`.
- Legacy implementation name: `tsnum`, retained only until the package rename
  migration is performed.

API contract:

- Python/NumPy spelling wins over TypeScript-native naming.
- NumPy argument order, default values, dtype behavior, broadcasting, shape
  behavior, and error behavior are the compatibility target.
- TypeScript helpers may exist only when they are additive and do not replace the
  Python-compatible surface.
- Current unpublished syntax may be redesigned or removed to match NumPy.

TypeScript grammar adapter contract:

- Python `a + b` maps to `np.add(a, b)`.
- Python `a - b` maps to `np.subtract(a, b)` with `np.sub` allowed as an alias.
- Python `a * b` maps to `np.multiply(a, b)` with `np.mul` allowed as an alias.
- Python `a / b` maps to `np.divide(a, b)` with `np.div` allowed as an alias.
- Python `a @ b` maps to `np.matmul(a, b)`.
- Python `x.T` remains `x.T`.
- Python slicing maps to explicit slice helpers, for example
  `np.slice(x, np.s(':', 0))` once the slice helper is implemented.

Async contract:

- Hot numerical operations must not return `Promise`.
- CPU default usage must be synchronous after import.
- Accelerated backends may require one async initialization call.
- GPU/native operations should return synchronous array handles and queue work
  behind the scenes, matching the PyTorch/CUDA mental model.
- `await` is allowed only at runtime boundaries: backend initialization,
  host/device transfer, `sync`, `tolist`, scalar readback, file/network I/O, and
  explicit compile/load operations.

Preferred accelerated DX:

```ts
import * as np from '@sylphx/numpy'

await np.use('webgpu')

const a = np.array([[1, 2], [3, 4]], { device: 'webgpu' })
const b = np.matmul(a, a.T)

await np.sync()
const values = await b.tolist()
```

## Rationale

- Python users recognize `np` immediately.
- Promise-free hot paths avoid turning every numerical expression into async
  noise.
- Explicit TypeScript grammar adapters are more honest and maintainable than
  pretending JavaScript can parse Python-only syntax.
- A named migration path lets the repo move from `tsnum` to the Python-native
  package surface without confusing current implementation evidence.

## Consequences

**Positive:**

- The first viewport and quick-start examples communicate Python compatibility.
- Async GPU behavior has a clear design rule.
- Future API changes can be evaluated against NumPy, not taste.

**Negative:**

- A package rename migration is required before public release.
- Some existing TypeScript-friendly short names become aliases rather than the
  canonical API.
- Legal/trademark review is required before publishing exact upstream-style
  package names.

## References

- Python parity performance contract:
  `.sylphx/decisions/005-python-parity-performance-contract.md`
- Current package metadata: `packages/numpy/package.json`
- Current README surfaces: `README.md`, `packages/numpy/README.md`
