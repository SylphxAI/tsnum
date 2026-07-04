import { Buffer } from 'node:buffer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { NativeBLASBackend } from '../../packages/numpy/src/backend/native-blas'
import { TypeScriptBackend } from '../../packages/numpy/src/backend/typescript'
import { add, array, getBackendInfo, initNativeBLAS, mul } from '../../packages/numpy/src/index'

type BenchResult = {
  name: string
  median_ms: number
  samples_ms: number[]
  checksum: number
}

type NativeKernelModule = {
  addF64: (left: Float64Array, right: Float64Array) => Float64Array
  addF64Buffer: (left: Float64Array, right: Float64Array, output: Buffer) => Buffer
  addF64Buffers: (left: Buffer, right: Buffer, output: Buffer) => Buffer
  addScalarF64: (input: Float64Array, scalar: number) => Float64Array
  addScalarF64Buffer: (input: Float64Array, scalar: number, output: Buffer) => Buffer
  addScalarF64Buffers: (input: Buffer, scalar: number, output: Buffer) => Buffer
  mulScalarF64: (input: Float64Array, scalar: number) => Float64Array
  mulScalarF64Buffer: (input: Float64Array, scalar: number, output: Buffer) => Buffer
  mulScalarF64Buffers: (input: Buffer, scalar: number, output: Buffer) => Buffer
  transposeF64Buffer: (input: Float64Array, rows: number, cols: number, output: Buffer) => Buffer
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const require = createRequire(import.meta.url)
const native = require(join(root, 'packages/numpy-native/index.js')) as NativeKernelModule

const length = readPositiveInt('NATIVE_DISPATCH_PROBE_LENGTH', 1_000_000)
const iterations = readPositiveInt('NATIVE_DISPATCH_PROBE_ITERATIONS', 30)
const warmup = readPositiveInt('NATIVE_DISPATCH_PROBE_WARMUP', 5)
const samples = readPositiveInt('NATIVE_DISPATCH_PROBE_SAMPLES', 3)

function readPositiveInt(name: string, defaultValue: number): number {
  const raw = process.env[name]
  if (!raw) return defaultValue
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`)
  }
  return Math.trunc(value)
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

function range(size: number, scale: number): Float64Array {
  const output = new Float64Array(size)
  for (let index = 0; index < size; index++) {
    output[index] = index * scale
  }
  return output
}

function bytes(array: Float64Array): Buffer {
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength)
}

function checksum(value: unknown): number {
  if (value instanceof Float64Array) {
    return Number(value[0]) + Number(value[value.length - 1]) + value.length
  }

  if (
    value &&
    typeof value === 'object' &&
    'getData' in value &&
    typeof value.getData === 'function' &&
    'size' in value
  ) {
    const array = value as { size: number; getData: () => { buffer: ArrayLike<number> } }
    const buffer = array.getData().buffer
    return Number(buffer[0]) + Number(buffer[buffer.length - 1]) + array.size
  }

  if (
    value &&
    typeof value === 'object' &&
    'buffer' in value &&
    (value as { buffer: unknown }).buffer instanceof Float64Array
  ) {
    const buffer = (value as { buffer: Float64Array }).buffer
    return Number(buffer[0]) + Number(buffer[buffer.length - 1]) + buffer.length
  }

  return Number.NaN
}

function measure(name: string, fn: () => unknown): BenchResult {
  const samplesMs: number[] = []
  let last: unknown

  for (let sample = 0; sample < samples; sample++) {
    for (let index = 0; index < warmup; index++) {
      fn()
    }

    const startedAt = performance.now()
    for (let index = 0; index < iterations; index++) {
      last = fn()
    }
    samplesMs.push((performance.now() - startedAt) / iterations)
  }

  return {
    name,
    median_ms: median(samplesMs),
    samples_ms: samplesMs,
    checksum: checksum(last),
  }
}

const left = range(length, 0.001)
const right = range(length, 0.002)
const output = new Float64Array(length)
const leftBytes = bytes(left)
const rightBytes = bytes(right)
const outputBytes = bytes(output)

const matrixSize = 512
const matrixLength = matrixSize * matrixSize
const matrix = range(matrixLength, 0.001)
const matrixOutput = new Float64Array(matrixLength)
const matrixBytes = bytes(matrix)
const matrixOutputBytes = bytes(matrixOutput)

const leftArray = array(Array.from(left), { dtype: 'float64' })
const rightArray = array(Array.from(right), { dtype: 'float64' })
const matrixArray = array(
  Array.from({ length: matrixSize }, (_, row) =>
    Array.from(matrix.subarray(row * matrixSize, (row + 1) * matrixSize)),
  ),
  { dtype: 'float64' },
)
const leftData = leftArray.getData()
const rightData = rightArray.getData()
const matrixData = matrixArray.getData()
const tsBackend = new TypeScriptBackend()
const nativeBackendInit = await initNativeBLAS()
const nativeBackend = new NativeBLASBackend()

const results = [
  measure('native.addScalarF64.return', () => native.addScalarF64(left, 5)),
  measure('native.addScalarF64.buffer', () => {
    native.addScalarF64Buffer(left, 5, outputBytes)
    return output
  }),
  measure('native.addScalarF64.buffers', () => {
    native.addScalarF64Buffers(leftBytes, 5, outputBytes)
    return output
  }),
  measure('native.addF64.return', () => native.addF64(left, right)),
  measure('native.addF64.buffer', () => {
    native.addF64Buffer(left, right, outputBytes)
    return output
  }),
  measure('native.addF64.buffers', () => {
    native.addF64Buffers(leftBytes, rightBytes, outputBytes)
    return output
  }),
  measure('native.mulScalarF64.return', () => native.mulScalarF64(left, 2)),
  measure('native.mulScalarF64.buffer', () => {
    native.mulScalarF64Buffer(left, 2, outputBytes)
    return output
  }),
  measure('native.mulScalarF64.buffers', () => {
    native.mulScalarF64Buffers(leftBytes, 2, outputBytes)
    return output
  }),
  measure('native.transposeF64.buffer', () => {
    native.transposeF64Buffer(matrix, matrixSize, matrixSize, matrixOutputBytes)
    return matrixOutput
  }),
  measure('backend.typescript.addScalar', () => tsBackend.add(leftData, 5)),
  measure('backend.typescript.addArrays', () => tsBackend.add(leftData, rightData)),
  measure('backend.typescript.mulScalar', () => tsBackend.mul(leftData, 2)),
  measure('backend.typescript.transpose512', () => tsBackend.transpose(matrixData)),
  measure('backend.native-blas.addScalar', () => nativeBackend.add(leftData, 5)),
  measure('backend.native-blas.addArrays', () => nativeBackend.add(leftData, rightData)),
  measure('backend.native-blas.mulScalar', () => nativeBackend.mul(leftData, 2)),
  measure('backend.native-blas.transpose512', () => nativeBackend.transpose(matrixData)),
  measure('public.addScalar', () => add(leftArray, 5)),
  measure('public.addArrays', () => add(leftArray, rightArray)),
  measure('public.mulScalar', () => mul(leftArray, 2)),
]

const report = {
  timestamp: new Date().toISOString(),
  length,
  iterations,
  warmup,
  samples,
  bun: Bun.version,
  platform: process.platform,
  arch: process.arch,
  backend: getBackendInfo(),
  native_backend_init: nativeBackendInit,
  results,
}

const resultPath = join(root, 'bench/python-parity/results/native-dispatch-latest.json')
const reportPath = join(root, 'bench/python-parity/results/native-dispatch-latest.md')
mkdirSync(dirname(resultPath), { recursive: true })
writeFileSync(resultPath, `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(reportPath, renderMarkdown(report))

console.log(
  `Native dispatch probe: length ${length}, median of ${samples} samples, ${iterations} iterations`,
)
for (const result of results) {
  console.log(`${result.name.padEnd(34)} ${result.median_ms.toFixed(4).padStart(10)} ms`)
}
console.log(`JSON: ${resultPath}`)
console.log(`Markdown: ${reportPath}`)

function renderMarkdown(data: typeof report): string {
  const lines = [
    '# Native Dispatch Probe',
    '',
    `Generated: ${data.timestamp}`,
    '',
    '## Runtime',
    '',
    `- Bun: ${data.bun}`,
    `- Platform: ${data.platform}`,
    `- Architecture: ${data.arch}`,
    `- Backend: ${data.backend.name}`,
    `- Native BLAS init: ${data.native_backend_init.success ? 'pass' : 'fail'}`,
    `- Length: ${data.length}`,
    `- Samples: median of ${data.samples}`,
    `- Iterations per sample: ${data.iterations}`,
    '',
    '## Results',
    '',
    '| Layer | Median ms | Checksum |',
    '| --- | ---: | ---: |',
  ]

  for (const result of data.results) {
    lines.push(`| ${result.name} | ${result.median_ms.toFixed(4)} | ${result.checksum} |`)
  }

  lines.push(
    '',
    '## Use',
    '',
    '- Use this probe before changing native dispatch so wrapper overhead is separated from kernel speed.',
    '- This is diagnostic evidence only; publish readiness remains gated by `bench:python-parity:enforce`.',
    '',
  )

  return `${lines.join('\n')}\n`
}
