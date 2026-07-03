import { performance } from 'node:perf_hooks'
import {
  add,
  array,
  getBackendInfo,
  initNativeBLAS,
  matmul,
  mean,
  mul,
  sum,
  transpose,
} from '../../packages/tsnum/src/index'

type BenchValue = number | { size: number; getData: () => { buffer: ArrayLike<number> } }

function measure(fn: () => BenchValue, iterations: number, warmup: number): number {
  for (let i = 0; i < warmup; i++) {
    fn()
  }

  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    const result = fn()
    if (result === undefined) {
      throw new Error('benchmark returned undefined')
    }
  }
  return (performance.now() - start) / iterations
}

function checksum(value: BenchValue): number {
  if (typeof value === 'number') {
    return value
  }

  const data = value.getData().buffer
  return Number(data[0]) + Number(data[data.length - 1]) + value.size
}

function range(length: number, scale: number): number[] {
  return Array.from({ length }, (_, index) => index * scale)
}

function matrix(rows: number, cols: number, scale: number): number[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => (row * cols + col) * scale),
  )
}

const nativeBLAS = await initNativeBLAS()
const backend = getBackendInfo()

const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
const vectorB = array(range(1_000_000, 0.002), { dtype: 'float64' })
const matrix512 = array(matrix(512, 512, 0.001), { dtype: 'float64' })
const left = array(matrix(128, 128, 0.001), { dtype: 'float64' })
const right = array(matrix(128, 128, 0.002), { dtype: 'float64' })

const cases: Record<string, [number, number, () => BenchValue]> = {
  add_scalar_1m: [30, 5, () => add(vector, 5)],
  add_arrays_1m: [30, 5, () => add(vector, vectorB)],
  mul_scalar_1m: [30, 5, () => mul(vector, 2)],
  sum_1m: [100, 10, () => sum(vector)],
  mean_1m: [100, 10, () => mean(vector)],
  transpose_512: [60, 10, () => transpose(matrix512)],
  matmul_128: [20, 5, () => matmul(left, right)],
}

const benchmarks: Record<string, unknown> = {}
for (const [name, [iterations, warmup, fn]] of Object.entries(cases)) {
  const last = fn()
  benchmarks[name] = {
    time_ms: measure(fn, iterations, warmup),
    iterations,
    warmup,
    checksum: checksum(last),
  }
}

console.log(
  JSON.stringify({
    runtime: 'bun-tsnum',
    bun: Bun.version,
    platform: process.platform,
    arch: process.arch,
    backend,
    native_blas_init: nativeBLAS,
    benchmarks,
  }),
)
