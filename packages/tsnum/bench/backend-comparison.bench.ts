import { bench, run } from 'mitata'
import { array, matmul, dot, fft, ifft, sin, cos, exp, log } from '../src/index'
import { getBackend } from '../src/backend'

// ===== Backend Comparison Benchmark =====
// Compare TypeScript vs WASM backend performance

console.log('Backend:', getBackend().name)
console.log('Expected Speedups (WASM vs TS):')
console.log('  - Matrix ops: 2-5x')
console.log('  - FFT ops: 5-20x')
console.log('  - Math functions: 2-5x (SIMD)\n')

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

// FFT data (power of 2 sizes)
const fft256 = array(Array.from({ length: 256 }, (_, i) => Math.sin(2 * Math.PI * i / 256)))
const fft1024 = array(Array.from({ length: 1024 }, (_, i) => Math.sin(2 * Math.PI * i / 1024)))
const fft4096 = array(Array.from({ length: 4096 }, (_, i) => Math.sin(2 * Math.PI * i / 4096)))

console.log('\n🔥 FFT Benchmarks')

bench('fft 256 points', () => {
  fft(fft256)
})

bench('fft 1024 points', () => {
  fft(fft1024)
})

bench('fft 4096 points', () => {
  fft(fft4096)
})

// FFT roundtrip
const fft256_result = fft(fft256)
bench('ifft 256 points', () => {
  ifft(fft256_result)
})

// Math functions data
const math1k = array(Array.from({ length: 1000 }, (_, i) => (i % 100) / 10 + 0.1))
const math10k = array(Array.from({ length: 10000 }, (_, i) => (i % 100) / 10 + 0.1))

console.log('\n🔥 Math Function Benchmarks')

bench('sin 1k elements', () => {
  sin(math1k)
})

bench('sin 10k elements', () => {
  sin(math10k)
})

bench('cos 1k elements', () => {
  cos(math1k)
})

bench('exp 1k elements', () => {
  exp(math1k)
})

bench('log 1k elements', () => {
  log(math1k)
})

await run()
