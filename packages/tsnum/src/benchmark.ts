// ===== Performance Benchmarks for tsnum =====
// Run with: bun run src/benchmark.ts

import { bench, run } from 'mitata'
import { add, array, mean, mul, pipe, reshape, sum, transpose } from './index'

// ===== Benchmark 1: Array Creation =====
bench('array creation (1D, n=1000)', () => {
  const data = Array.from({ length: 1000 }, (_, i) => i)
  array(data)
})

bench('array creation (2D, 100x100)', () => {
  const data = Array.from({ length: 100 }, () => Array.from({ length: 100 }, (_, i) => i))
  array(data)
})

// ===== Benchmark 2: Arithmetic Operations =====
const arr1d = array(Array.from({ length: 10000 }, (_, i) => i))
const arr2d = array(Array.from({ length: 100 }, () => Array.from({ length: 100 }, (_, i) => i)))

bench('add scalar (n=10000)', () => {
  add(arr1d, 5)
})

bench('mul scalar (n=10000)', () => {
  mul(arr1d, 2)
})

bench('add arrays (n=10000)', () => {
  add(arr1d, arr1d)
})

// ===== Benchmark 3: Reductions =====
bench('sum (n=10000)', () => {
  sum(arr1d)
})

bench('mean (n=10000)', () => {
  mean(arr1d)
})

// ===== Benchmark 4: Pipe Composition =====
bench('pipe composition (4 operations)', () => {
  pipe(
    arr1d,
    (a) => add(a, 10),
    (a) => mul(a, 2),
    (a) => add(a, 5),
    sum,
  )
})

// ===== Benchmark 5: Shape Operations =====
bench('reshape (10000 -> 100x100)', () => {
  reshape(arr1d, [100, 100])
})

bench('transpose (100x100)', () => {
  transpose(arr2d)
})

// ===== Benchmark 6: Complex Pipeline =====
bench('complex pipeline (reshape + transpose + arithmetic + sum)', () => {
  pipe(
    arr1d,
    (a) => reshape(a, [100, 100]),
    transpose,
    (a) => add(a, 10),
    (a) => mul(a, 2),
    sum,
  )
})

console.log('\n🚀 Running tsnum performance benchmarks...\n')
await run()
