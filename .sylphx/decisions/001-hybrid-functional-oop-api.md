# 001. Hybrid Functional/OOP API Design

**Status:** 📦 Superseded by ADR-004
**Date:** 2025-01-XX

## Context
NumPy uses OOP API (`arr.sum()`), but modern JS/TS favors functional patterns and tree-shaking. Pure OOP bundles entire class, pure functional less ergonomic.

## Decision
Provide both APIs: NDArray class (OOP) + standalone functions (functional). Same operations, different access patterns.

## Rationale
- OOP familiar to NumPy users, enables method chaining
- Functional enables tree-shaking (import only `add`, `sum`)
- TypeScript developers expect both patterns
- Minimal cost: functions delegate to methods (or vice versa)

## Consequences
**Positive:**
- Maximum flexibility: users choose style
- Tree-shakeable when using functional API
- Type inference excellent for both

**Negative:**
- Two APIs to maintain (mitigated: one delegates to other)
- Docs need to show both styles

## References
- Implementation: `src/ndarray.ts`, `src/ops/index.ts`
- Example: `array([1,2]).add(3)` vs `add(array([1,2]), 3)`
