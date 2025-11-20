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

Run benchmarks: `bun run src/benchmark.ts`

**Latest Results** (Apple M4, Bun 1.3.2):

### Array Creation
- **1D array (n=1000)**: ~7.0 µs/iter
- **2D array (100×100)**: ~103.7 µs/iter

### Arithmetic Operations (n=10,000)
| Operation | Time | Throughput |
|-----------|------|------------|
| **Scalar addition** | ~6.8 µs | ~1.47 billion ops/s |
| **Scalar multiplication** | ~7.6 µs | ~1.32 billion ops/s |
| **Array addition** | ~8.3 µs | ~1.20 billion ops/s |

### Reductions (n=10,000)
| Operation | Time | Throughput |
|-----------|------|------------|
| **sum()** | ~3.8 µs ⚡ | ~2.63 billion ops/s |
| **mean()** | ~3.7 µs ⚡ | ~2.70 billion ops/s |

### Shape Operations (Zero-Copy!)
- **reshape()**: ~32 ns/iter ⚡⚡⚡ (metadata-only, shares buffer)
- **transpose() (100×100)**: ~79.0 µs/iter (stride adjustment only)

### Composition
- **pipe() with 4 operations**: ~79.3 µs/iter
- **Complex pipeline** (reshape → transpose → arithmetic → sum): ~102.3 µs/iter

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
