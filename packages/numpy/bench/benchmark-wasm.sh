#!/bin/bash
# Run backend comparison benchmarks with TypeScript and WASM backends

echo "========================================="
echo "Backend Comparison: TypeScript vs WASM"
echo "========================================="
echo ""

# Force TypeScript backend
echo "🟦 TypeScript Backend"
echo "-------------------------------------"
FORCE_TS_BACKEND=1 bun bench/backend-comparison.bench.ts

echo ""
echo ""
echo "🟧 WASM Backend"
echo "-------------------------------------"
bun bench/backend-comparison.bench.ts

echo ""
echo "========================================="
echo "Benchmark Complete"
echo "========================================="
