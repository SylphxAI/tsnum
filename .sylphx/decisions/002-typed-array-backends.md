# 002. TypedArray-based Storage

**Status:** ✅ Accepted
**Date:** 2025-01-XX

## Context
Need efficient numeric storage. Options: `number[]`, TypedArrays, custom buffer.

## Decision
Use TypedArrays (Float64Array, Int32Array, etc.) as buffer backend for all NDArrays.

## Rationale
- 2-10x faster than `number[]` for numeric operations
- Zero-copy interop with WASM (future)
- Dtype enforcement at runtime (type safety)
- Native browser/Node.js support, no dependencies

## Consequences
**Positive:**
- Performance competitive with native libraries
- Direct WASM memory sharing (future)
- Dtype system enforced by construction

**Negative:**
- More complex than `number[]` (strides, indexing)
- Fixed dtype per array (can't mix int/float in one array)

## References
- Implementation: `src/core/types.ts` (DTYPE_TO_TYPEDARRAY)
- Example: `zeros([3,3], {dtype: 'float32'})` creates Float32Array
