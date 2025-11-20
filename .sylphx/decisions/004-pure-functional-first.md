# 004. Pure Functional-First API (Single API)

**Status:** ✅ Accepted
**Date:** 2025-01-20

## Context
ADR-001 established hybrid functional/OOP design, but performance analysis showed 5-10% overhead, 50%+ maintenance cost. User emphasized: "我地本身就係functional-first" (we are functional-first originally). NumPy is actually 90% functional (`np.sum(a)`), not hybrid.

## Decision
Single functional API only. NDArray becomes pure data container with properties (shape, dtype, size, T). All operations are module-level functions.

## Rationale
- 5-10% performance gain (no method delegation overhead)
- 50% maintenance reduction (single code path)
- Better tree-shaking (no class bundling)
- Matches NumPy's actual design (functional core)
- Aligns with team's functional-first philosophy
- `pipe` composition more elegant than method chaining

## Consequences
**Positive:**
- Faster execution (no OOP overhead)
- Smaller bundles (pure functions)
- Simpler codebase (one API path)
- Better composition (`pipe(arr, fn1, fn2)`)

**Negative:**
- No method chaining (`arr.add().mul()` not available)
- Migration required for existing code

## References
- Implementation: `src/ndarray.ts` (properties only), `src/ops/` (pure functions)
- Supersedes: ADR-001
- Migration: `arr.add(5)` → `add(arr, 5)` or `pipe(arr, a => add(a, 5))`
