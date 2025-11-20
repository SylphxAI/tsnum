import { bench, run } from 'mitata'
import { array, matmul, dot } from '../src/index'
import { getBackend, initWASM } from '../src/backend'

// ===== Backend Comparison Benchmark =====
// Compare TypeScript vs WASM backend performance

console.log('Backend:', getBackend().name)

// Small matrices (fast operations)
const a2x2 = array([
  [1, 2],
  [3, 4],
])
const b2x2 = array([
  [5, 6],
  [7, 8],
])

// Medium matrices
const a10x10 = array(
  Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => i * 10 + j + 1),
  ),
)
const b10x10 = array(
  Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => (i + 1) * (j + 1)),
  ),
)

// Large matrices
const a100x100 = array(
  Array.from({ length: 100 }, (_, i) =>
    Array.from({ length: 100 }, (_, j) => (i * 100 + j) % 100 + 1),
  ),
)
const b100x100 = array(
  Array.from({ length: 100 }, (_, i) =>
    Array.from({ length: 100 }, (_, j) => ((i + 1) * (j + 1)) % 100),
  ),
)

// Vectors for dot product
const v100 = array(Array.from({ length: 100 }, (_, i) => i + 1))
const w100 = array(Array.from({ length: 100 }, (_, i) => (i % 10) + 1))

const v1000 = array(Array.from({ length: 1000 }, (_, i) => i + 1))
const w1000 = array(Array.from({ length: 1000 }, (_, i) => (i % 10) + 1))

console.log('\n🔥 Matrix Multiplication Benchmarks')

bench('matmul 2×2 (tiny)', () => {
  matmul(a2x2, b2x2)
})

bench('matmul 10×10 (small)', () => {
  matmul(a10x10, b10x10)
})

bench('matmul 100×100 (medium)', () => {
  matmul(a100x100, b100x100)
})

console.log('\n🔥 Dot Product Benchmarks')

bench('dot 100 elements', () => {
  dot(v100, w100)
})

bench('dot 1000 elements', () => {
  dot(v1000, w1000)
})

await run()
