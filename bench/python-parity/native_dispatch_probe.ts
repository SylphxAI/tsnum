import { FFIType, dlopen, ptr } from 'bun:ffi'
import { Buffer } from 'node:buffer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { NativeBLASBackend } from '../../packages/numpy/src/backend/native-blas'
import { TypeScriptBackend } from '../../packages/numpy/src/backend/typescript'
import {
  add,
  array,
  empty,
  getBackendInfo,
  initNativeBLAS,
  matmul,
  mul,
} from '../../packages/numpy/src/index'

type BenchResult = {
  name: string
  median_ms: number
  samples_ms: number[]
  checksum: number
  iterations: number
  warmup: number
  samples: number
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

const CBLAS_COLUMN_MAJOR = 102
const CBLAS_NO_TRANS = 111

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const require = createRequire(import.meta.url)
const native = require(join(root, 'packages/numpy-native/index.js')) as NativeKernelModule
const accelerate = dlopen('/System/Library/Frameworks/Accelerate.framework/Accelerate', {
  cblas_dgemm: {
    args: [
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.i32,
      FFIType.f64,
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.f64,
      FFIType.ptr,
      FFIType.i32,
    ],
    returns: FFIType.void,
  },
  vDSP_vsaddD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.u64],
    returns: FFIType.void,
  },
  vDSP_vsmulD: {
    args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.u64],
    returns: FFIType.void,
  },
  vDSP_vaddD: {
    args: [
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.ptr,
      FFIType.i32,
      FFIType.u64,
    ],
    returns: FFIType.void,
  },
})

const length = readPositiveInt('NATIVE_DISPATCH_PROBE_LENGTH', 1_000_000)
const iterations = readPositiveInt('NATIVE_DISPATCH_PROBE_ITERATIONS', 30)
const warmup = readPositiveInt('NATIVE_DISPATCH_PROBE_WARMUP', 5)
const samples = readPositiveInt('NATIVE_DISPATCH_PROBE_SAMPLES', 3)
const matmulIterations = readPositiveInt('NATIVE_DISPATCH_PROBE_MATMUL_ITERATIONS', 1000)
const matmulWarmup = readPositiveInt('NATIVE_DISPATCH_PROBE_MATMUL_WARMUP', 100)
const matmulSamples = readPositiveInt('NATIVE_DISPATCH_PROBE_MATMUL_SAMPLES', 7)

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

function percentile(values: number[], percentileRank: number): number {
  if (values.length === 0) {
    return Number.NaN
  }

  const sorted = values.toSorted((a, b) => a - b)
  const index = Math.ceil((percentileRank / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))]
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return Number.NaN
  }

  return values.reduce((total, value) => total + value, 0) / values.length
}

function relativeStddev(values: number[]): number {
  const average = mean(values)
  if (!Number.isFinite(average) || average === 0) {
    return Number.NaN
  }

  const variance = mean(values.map((value) => (value - average) * (value - average)))
  return Math.sqrt(variance) / average
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : 'unknown'
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

function createNativeOutput(length: number): Float64Array {
  const bytes = Buffer.allocUnsafe(length * Float64Array.BYTES_PER_ELEMENT)
  if (bytes.byteOffset % Float64Array.BYTES_PER_ELEMENT !== 0) {
    return new Float64Array(length)
  }
  return new Float64Array(bytes.buffer, bytes.byteOffset, length)
}

function createNativeOutputBuffer(length: number): { array: Float64Array; bytes: Buffer } {
  const outputBytes = Buffer.allocUnsafe(length * Float64Array.BYTES_PER_ELEMENT)
  if (outputBytes.byteOffset % Float64Array.BYTES_PER_ELEMENT !== 0) {
    const array = new Float64Array(length)
    return { array, bytes: bytes(array) }
  }
  return {
    array: new Float64Array(outputBytes.buffer, outputBytes.byteOffset, length),
    bytes: outputBytes,
  }
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

type MeasureOptions = {
  iterations?: number
  warmup?: number
  samples?: number
}

const matmulMeasureOptions = {
  iterations: matmulIterations,
  warmup: matmulWarmup,
  samples: matmulSamples,
}

function measure(name: string, fn: () => unknown, options: MeasureOptions = {}): BenchResult {
  const caseIterations = options.iterations ?? iterations
  const caseWarmup = options.warmup ?? warmup
  const caseSamples = options.samples ?? samples
  const samplesMs: number[] = []
  let last: unknown

  for (let sample = 0; sample < caseSamples; sample++) {
    for (let index = 0; index < caseWarmup; index++) {
      fn()
    }

    const startedAt = performance.now()
    for (let index = 0; index < caseIterations; index++) {
      last = fn()
    }
    samplesMs.push((performance.now() - startedAt) / caseIterations)
  }

  return {
    name,
    median_ms: median(samplesMs),
    samples_ms: samplesMs,
    checksum: checksum(last),
    iterations: caseIterations,
    warmup: caseWarmup,
    samples: caseSamples,
  }
}

const left = range(length, 0.001)
const right = range(length, 0.002)
const output = new Float64Array(length)
const leftBytes = bytes(left)
const rightBytes = bytes(right)
const outputBytes = bytes(output)
const scalar = new Float64Array(1)
const scalarPointer = ptr(scalar)
const leftPointer = ptr(left)
const rightPointer = ptr(right)
const outputPointer = ptr(output)

const matrixSize = 512
const matrixLength = matrixSize * matrixSize
const matrix = range(matrixLength, 0.001)
const matrixOutput = new Float64Array(matrixLength)
const matrixOutputBytes = bytes(matrixOutput)
const matmulSize = 128
const matmulLength = matmulSize * matmulSize
const matmulLeft = range(matmulLength, 0.001)
const matmulRight = range(matmulLength, 0.002)
const matmulOutput = new Float64Array(matmulLength)
const matmulLeftPointer = ptr(matmulLeft)
const matmulRightPointer = ptr(matmulRight)
const matmulOutputPointer = ptr(matmulOutput)

function cblasDgemm128(output: Float64Array, outputPointer = ptr(output)): Float64Array {
  // Row-major C = A x B has the same memory layout as column-major
  // C^T = B^T x A^T, matching the NativeBLASBackend implementation.
  accelerate.symbols.cblas_dgemm(
    CBLAS_COLUMN_MAJOR,
    CBLAS_NO_TRANS,
    CBLAS_NO_TRANS,
    matmulSize,
    matmulSize,
    matmulSize,
    1.0,
    matmulRightPointer,
    matmulSize,
    matmulLeftPointer,
    matmulSize,
    0.0,
    outputPointer,
    matmulSize,
  )
  return output
}

function vDSPScalarAdd(output: Float64Array): Float64Array {
  scalar[0] = 5
  accelerate.symbols.vDSP_vsaddD(leftPointer, 1, scalarPointer, outputPointer, 1, length)
  return output
}

function vDSPScalarMul(output: Float64Array): Float64Array {
  scalar[0] = 2
  accelerate.symbols.vDSP_vsmulD(leftPointer, 1, scalarPointer, outputPointer, 1, length)
  return output
}

function vDSPAdd(output: Float64Array): Float64Array {
  accelerate.symbols.vDSP_vaddD(leftPointer, 1, rightPointer, 1, outputPointer, 1, length)
  return output
}

const leftArray = array(Array.from(left), { dtype: 'float64' })
const rightArray = array(Array.from(right), { dtype: 'float64' })
const vectorOutputArray = empty([length], { dtype: 'float64' })
const matrixArray = array(
  Array.from({ length: matrixSize }, (_, row) =>
    Array.from(matrix.subarray(row * matrixSize, (row + 1) * matrixSize)),
  ),
  { dtype: 'float64' },
)
const matmulLeftArray = array(
  Array.from({ length: matmulSize }, (_, row) =>
    Array.from(matmulLeft.subarray(row * matmulSize, (row + 1) * matmulSize)),
  ),
  { dtype: 'float64' },
)
const matmulRightArray = array(
  Array.from({ length: matmulSize }, (_, row) =>
    Array.from(matmulRight.subarray(row * matmulSize, (row + 1) * matmulSize)),
  ),
  { dtype: 'float64' },
)
const matmulOutputArray = empty([matmulSize, matmulSize], { dtype: 'float64' })
const leftData = leftArray.getData()
const rightData = rightArray.getData()
const matrixData = matrixArray.getData()
const matmulLeftData = matmulLeftArray.getData()
const matmulRightData = matmulRightArray.getData()
const tsBackend = new TypeScriptBackend()
const nativeBackendInit = await initNativeBLAS()
const nativeBackend = new NativeBLASBackend()

const results = [
  measure('native.allocFloat64', () => new Float64Array(length)),
  measure('native.allocBufferView', () => createNativeOutput(length)),
  measure('native.addScalarF64.return', () => native.addScalarF64(left, 5)),
  measure('native.addScalarF64.buffer', () => {
    native.addScalarF64Buffer(left, 5, outputBytes)
    return output
  }),
  measure('native.addScalarF64.buffers', () => {
    native.addScalarF64Buffers(leftBytes, 5, outputBytes)
    return output
  }),
  measure('native.addScalarF64Buffer.allocFloat64', () => {
    const allocated = new Float64Array(length)
    native.addScalarF64Buffer(left, 5, bytes(allocated))
    return allocated
  }),
  measure('native.addScalarF64Buffers.allocBuffer', () => {
    const allocated = createNativeOutputBuffer(length)
    native.addScalarF64Buffers(leftBytes, 5, allocated.bytes)
    return allocated.array
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
  measure('native.addF64Buffer.allocFloat64', () => {
    const allocated = new Float64Array(length)
    native.addF64Buffer(left, right, bytes(allocated))
    return allocated
  }),
  measure('native.addF64Buffers.allocBuffer', () => {
    const allocated = createNativeOutputBuffer(length)
    native.addF64Buffers(leftBytes, rightBytes, allocated.bytes)
    return allocated.array
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
  measure('native.mulScalarF64Buffer.allocFloat64', () => {
    const allocated = new Float64Array(length)
    native.mulScalarF64Buffer(left, 2, bytes(allocated))
    return allocated
  }),
  measure('native.mulScalarF64Buffers.allocBuffer', () => {
    const allocated = createNativeOutputBuffer(length)
    native.mulScalarF64Buffers(leftBytes, 2, allocated.bytes)
    return allocated.array
  }),
  measure('native.vDSP_vsaddD.preallocated', () => vDSPScalarAdd(output)),
  measure('native.vDSP_vsmulD.preallocated', () => vDSPScalarMul(output)),
  measure('native.vDSP_vaddD.preallocated', () => vDSPAdd(output)),
  measure('native.transposeF64.buffer', () => {
    native.transposeF64Buffer(matrix, matrixSize, matrixSize, matrixOutputBytes)
    return matrixOutput
  }),
  measure(
    'native.cblasDgemm.preallocated',
    () => cblasDgemm128(matmulOutput, matmulOutputPointer),
    matmulMeasureOptions,
  ),
  measure(
    'native.cblasDgemm.allocFloat64',
    () => cblasDgemm128(new Float64Array(matmulLength)),
    matmulMeasureOptions,
  ),
  measure(
    'native.cblasDgemm.allocBuffer',
    () => cblasDgemm128(createNativeOutput(matmulLength)),
    matmulMeasureOptions,
  ),
  measure('backend.typescript.addScalar', () => tsBackend.add(leftData, 5)),
  measure('backend.typescript.addArrays', () => tsBackend.add(leftData, rightData)),
  measure('backend.typescript.mulScalar', () => tsBackend.mul(leftData, 2)),
  measure('backend.typescript.transpose512', () => tsBackend.transpose(matrixData)),
  measure(
    'backend.typescript.matmul128',
    () => tsBackend.matmul(matmulLeftData, matmulRightData),
    matmulMeasureOptions,
  ),
  measure('backend.native-blas.addScalar', () => nativeBackend.add(leftData, 5)),
  measure('backend.native-blas.addArrays', () => nativeBackend.add(leftData, rightData)),
  measure('backend.native-blas.mulScalar', () => nativeBackend.mul(leftData, 2)),
  measure('backend.native-blas.transpose512', () => nativeBackend.transpose(matrixData)),
  measure(
    'backend.native-blas.matmul128',
    () => nativeBackend.matmul(matmulLeftData, matmulRightData),
    matmulMeasureOptions,
  ),
  measure('public.addScalar', () => add(leftArray, 5)),
  measure('public.addScalar.out', () => add(leftArray, 5, { out: vectorOutputArray })),
  measure('public.addArrays', () => add(leftArray, rightArray)),
  measure('public.addArrays.out', () => add(leftArray, rightArray, { out: vectorOutputArray })),
  measure('public.mulScalar', () => mul(leftArray, 2)),
  measure('public.mulScalar.out', () => mul(leftArray, 2, { out: vectorOutputArray })),
  measure(
    'public.matmul128',
    () => matmul(matmulLeftArray, matmulRightArray),
    matmulMeasureOptions,
  ),
  measure(
    'public.matmul128.out',
    () => matmul(matmulLeftArray, matmulRightArray, { out: matmulOutputArray }),
    matmulMeasureOptions,
  ),
]

const report = {
  timestamp: new Date().toISOString(),
  length,
  iterations,
  warmup,
  samples,
  matmul_iterations: matmulIterations,
  matmul_warmup: matmulWarmup,
  matmul_samples: matmulSamples,
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
console.log(
  `Matmul probe override: median of ${matmulSamples} samples, ${matmulIterations} iterations`,
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
    `- Matmul samples: median of ${data.matmul_samples}`,
    `- Matmul iterations per sample: ${data.matmul_iterations}`,
    '',
    '## Results',
    '',
    '| Layer | Median ms | p95 ms | RSD | Samples | Iterations | Checksum |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const result of data.results) {
    lines.push(
      `| ${result.name} | ${result.median_ms.toFixed(4)} | ${percentile(result.samples_ms, 95).toFixed(4)} | ${formatPercent(relativeStddev(result.samples_ms))} | ${result.samples} | ${result.iterations} | ${result.checksum} |`,
    )
  }

  lines.push(
    '',
    '## Use',
    '',
    '- Use this probe before changing native dispatch so wrapper overhead is separated from kernel speed.',
    '- This is diagnostic evidence only; publish readiness remains gated by `bench:python-parity:repeatability`.',
    '',
  )

  return `${lines.join('\n')}\n`
}
