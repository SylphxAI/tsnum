import { performance } from 'node:perf_hooks'
import {
  add,
  array,
  empty,
  getBackendInfo,
  initNativeBLAS,
  matmul,
  mean,
  mul,
  sum,
  transpose,
} from '../../packages/numpy/src/index'

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

type BenchCaseFactory = () => [number, number, () => BenchValue]

const nativeBLAS = await initNativeBLAS()
const backend = getBackendInfo()

const cases: Record<string, BenchCaseFactory> = {
  add_scalar_1m: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    return [100, 20, () => add(vector, 5)]
  },
  add_scalar_1m_out: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    const out = empty([1_000_000], { dtype: 'float64' })
    const options = { out }
    return [2000, 100, () => add(vector, 5, options)]
  },
  add_arrays_1m: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    const vectorB = array(range(1_000_000, 0.002), { dtype: 'float64' })
    return [100, 20, () => add(vector, vectorB)]
  },
  add_arrays_1m_out: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    const vectorB = array(range(1_000_000, 0.002), { dtype: 'float64' })
    const out = empty([1_000_000], { dtype: 'float64' })
    const options = { out }
    return [100, 20, () => add(vector, vectorB, options)]
  },
  mul_scalar_1m: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    return [100, 20, () => mul(vector, 2)]
  },
  mul_scalar_1m_out: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    const out = empty([1_000_000], { dtype: 'float64' })
    const options = { out }
    return [2000, 100, () => mul(vector, 2, options)]
  },
  sum_1m: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    return [300, 30, () => sum(vector)]
  },
  mean_1m: () => {
    const vector = array(range(1_000_000, 0.001), { dtype: 'float64' })
    return [300, 30, () => mean(vector)]
  },
  transpose_512: () => {
    const matrix512 = array(matrix(512, 512, 0.001), { dtype: 'float64' })
    return [120, 20, () => transpose(matrix512)]
  },
  matmul_128: () => {
    const left = array(matrix(128, 128, 0.001), { dtype: 'float64' })
    const right = array(matrix(128, 128, 0.002), { dtype: 'float64' })
    return [1000, 100, () => matmul(left, right)]
  },
}

const selectedCase = process.env.PYTHON_PARITY_CASE
if (selectedCase && !cases[selectedCase]) {
  throw new Error(`Unknown PYTHON_PARITY_CASE: ${selectedCase}`)
}

const benchmarks: Record<string, unknown> = {}
for (const [name, createCase] of Object.entries(cases)) {
  if (selectedCase && name !== selectedCase) {
    continue
  }

  const [iterations, warmup, fn] = createCase()
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
    runtime: 'bun-sylphx-numpy',
    bun: Bun.version,
    platform: process.platform,
    arch: process.arch,
    backend,
    native_blas_init: nativeBLAS,
    benchmarks,
  }),
)
