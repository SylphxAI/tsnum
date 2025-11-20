# Performance Benchmarks

Performance characteristics of tsnum on Apple M4 (Bun 1.3.2).

## Bundle Size

- **Total gzipped**: ~6.8KB (well under 20KB target)
- **Uncompressed**: ~42.5KB
- **Tree-shakeable**: Import only what you need

### Per-module gzipped sizes:
```
creation.js:       1.4KB
ndarray.js:        840 bytes
core/utils.js:     884 bytes
ops/arithmetic.js: 599 bytes
ops/shape.js:      595 bytes
ops/comparison.js: 586 bytes
ops/reductions.js: 480 bytes
functional.js:     234 bytes
```

## Runtime Performance

Run benchmarks: `bun run bench`

### Array Creation
- **1D array (n=1000)**: ~5.4 µs/iter
- **2D array (100×100)**: ~73.5 µs/iter

### Arithmetic Operations (n=10,000)
- **Scalar addition**: ~5.3 µs/iter
- **Scalar multiplication**: ~6.0 µs/iter
- **Array addition**: ~6.5 µs/iter

### Reductions (n=10,000)
- **sum()**: ~3.2 µs/iter ⚡
- **mean()**: ~3.2 µs/iter ⚡

### Shape Operations
- **reshape()**: ~28 ns/iter ⚡⚡ (metadata-only operation)
- **transpose() (100×100)**: ~63.7 µs/iter

### Composition
- **pipe() with 4 operations**: ~25 µs/iter
- **Complex pipeline** (reshape → transpose → arithmetic → sum): ~80 µs/iter

## Performance Notes

1. **Zero overhead for reshape**: Shape operations are metadata-only, extremely fast
2. **Efficient reductions**: sum/mean leverage native TypedArray performance
3. **Pipe composition**: Minimal overhead compared to direct function calls
4. **Memory efficiency**: TypedArray backend uses native memory layout

## Comparison (Coming Soon)

Future benchmarks will compare with:
- NumPy (via Pyodide)
- numpy.js
- ndarray packages

## Future Optimizations (Roadmap)

- **v0.3**: WASM acceleration for large arrays (>1000 elements)
- **v0.4**: SIMD operations for arithmetic
- **v0.5**: Lazy evaluation for complex pipelines
