import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderMarkdownReport } from './report'

type BenchCase = {
  time_ms: number
  iterations: number
  warmup: number
  checksum: number
  time_ms_samples?: number[]
}

type BenchReport = {
  runtime: string
  benchmarks: Record<string, BenchCase>
}

type RuntimeName = 'python' | 'ts'

type SamplePair = {
  index: number
  order: RuntimeName[]
  python: BenchReport
  ts: BenchReport
}

type SummaryStats = {
  min: number
  median: number
  p75: number
  p95: number
  max: number
  mean: number
  stddev: number
  relative_stddev: number
}

type BenchmarkCaseConfig = {
  name: string
  gate: 'release' | 'diagnostic'
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const enforce = process.argv.includes('--enforce')
const python = process.env.PYTHON ?? 'python3'
const maxSlowdown = Number(process.env.PYTHON_PARITY_MAX_SLOWDOWN ?? '1.05')
const checksumAtol = Number(process.env.PYTHON_PARITY_CHECKSUM_ATOL ?? '1e-6')
const checksumRtol = Number(process.env.PYTHON_PARITY_CHECKSUM_RTOL ?? '1e-9')
const configuredSampleCount = Number(process.env.PYTHON_PARITY_RUNS ?? '7')
const sampleCount = Number.isFinite(configuredSampleCount)
  ? Math.max(1, Math.trunc(configuredSampleCount))
  : 7
const benchmarkCases: BenchmarkCaseConfig[] = [
  { name: 'add_arrays_1m', gate: 'diagnostic' },
  { name: 'add_arrays_1m_out', gate: 'release' },
  { name: 'add_scalar_1m', gate: 'diagnostic' },
  { name: 'add_scalar_1m_out', gate: 'release' },
  { name: 'matmul_128', gate: 'diagnostic' },
  { name: 'matmul_128_out', gate: 'release' },
  { name: 'mean_1m', gate: 'release' },
  { name: 'mul_scalar_1m', gate: 'diagnostic' },
  { name: 'mul_scalar_1m_out', gate: 'release' },
  { name: 'sum_1m', gate: 'release' },
  { name: 'transpose_512', gate: 'release' },
]
const allBenchmarkCaseNames = benchmarkCases.map((benchmarkCase) => benchmarkCase.name)
const selectedCase = process.env.PYTHON_PARITY_CASE
if (selectedCase && !allBenchmarkCaseNames.includes(selectedCase)) {
  throw new Error(`Unknown PYTHON_PARITY_CASE: ${selectedCase}`)
}
const benchmarkCaseNames = selectedCase ? [selectedCase] : allBenchmarkCaseNames
const benchmarkCaseConfigByName = new Map(
  benchmarkCases.map((benchmarkCase) => [benchmarkCase.name, benchmarkCase]),
)

function checksumMatches(actual: number, expected: number): boolean {
  const tolerance = Math.max(checksumAtol, Math.abs(expected) * checksumRtol)
  return Math.abs(actual - expected) <= tolerance
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[middle]
  }
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

function summaryStats(values: number[]): SummaryStats {
  const average = mean(values)
  const variance =
    values.length === 0
      ? Number.NaN
      : mean(values.map((value) => (value - average) * (value - average)))
  const stddev = Math.sqrt(variance)

  return {
    min: values.length === 0 ? Number.NaN : Math.min(...values),
    median: median(values),
    p75: percentile(values, 75),
    p95: percentile(values, 95),
    max: values.length === 0 ? Number.NaN : Math.max(...values),
    mean: average,
    stddev,
    relative_stddev: average === 0 ? Number.NaN : stddev / average,
  }
}

function runJson(command: string[], cwd: string, env: Record<string, string> = {}): BenchReport {
  const result = Bun.spawnSync(command, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdout: 'pipe',
    stderr: 'pipe',
  })

  if (!result.success) {
    const stderr = new TextDecoder().decode(result.stderr).trim()
    const stdout = new TextDecoder().decode(result.stdout).trim()
    throw new Error(
      [
        `Command failed: ${command.join(' ')}`,
        stdout ? `stdout:\n${stdout}` : '',
        stderr ? `stderr:\n${stderr}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return JSON.parse(new TextDecoder().decode(result.stdout)) as BenchReport
}

function runRuntimeSample(runtime: RuntimeName): BenchReport {
  const env = selectedCase ? { PYTHON_PARITY_CASE: selectedCase } : {}
  if (runtime === 'python') {
    return runJson([python, 'bench/python-parity/python_bench.py'], root, env)
  }

  return runJson([process.execPath, 'run', 'bench/python-parity/ts_bench.ts'], root, env)
}

function aggregateReport(reports: BenchReport[]): BenchReport {
  const firstReport = reports[0]
  if (!firstReport) {
    throw new Error('Cannot aggregate zero benchmark reports')
  }

  const benchmarks: Record<string, BenchCase> = {}
  for (const name of Object.keys(firstReport.benchmarks)) {
    const cases = reports.map((report) => {
      const benchmark = report.benchmarks[name]
      if (!benchmark) {
        throw new Error(`Missing benchmark case in sample: ${name}`)
      }
      return benchmark
    })
    const timeSamples = cases.map((benchmark) => benchmark.time_ms)

    benchmarks[name] = {
      time_ms: median(timeSamples),
      iterations: cases[0].iterations,
      warmup: cases[0].warmup,
      checksum: cases[0].checksum,
      time_ms_samples: timeSamples,
    }
  }

  return {
    ...firstReport,
    benchmarks,
  }
}

const samplePairs: SamplePair[] = []
for (let i = 0; i < sampleCount; i++) {
  const order: RuntimeName[] = i % 2 === 0 ? ['python', 'ts'] : ['ts', 'python']
  let pythonSample: BenchReport | undefined
  let tsSample: BenchReport | undefined

  for (const runtime of order) {
    const runtimeReport = runRuntimeSample(runtime)
    for (const caseName of benchmarkCaseNames) {
      if (!runtimeReport.benchmarks[caseName]) {
        throw new Error(
          `Runtime ${runtimeReport.runtime} did not report benchmark case: ${caseName}`,
        )
      }
    }

    if (runtime === 'python') {
      pythonSample = runtimeReport
    } else {
      tsSample = runtimeReport
    }
  }

  if (!pythonSample || !tsSample) {
    throw new Error(`Missing benchmark sample pair ${i + 1}`)
  }

  samplePairs.push({
    index: i + 1,
    order,
    python: pythonSample,
    ts: tsSample,
  })
}

const pythonSamples = samplePairs.map((pair) => pair.python)
const tsSamples = samplePairs.map((pair) => pair.ts)
const pythonReport = aggregateReport(pythonSamples)
const tsReport = aggregateReport(tsSamples)

const rows = benchmarkCaseNames.map((name) => {
  const pythonCase = pythonReport.benchmarks[name]
  const tsCase = tsReport.benchmarks[name]
  if (!tsCase) {
    throw new Error(`Missing @sylphx/numpy benchmark case: ${name}`)
  }

  const checksum_pass = tsSamples.every((sample, index) => {
    const tsSample = sample.benchmarks[name]
    const pythonSample = pythonSamples[index]?.benchmarks[name]
    if (!tsSample || !pythonSample) {
      return false
    }
    return checksumMatches(tsSample.checksum, pythonSample.checksum)
  })
  const pythonMsSamples = pythonCase.time_ms_samples ?? []
  const tsMsSamples = tsCase.time_ms_samples ?? []
  const pairedSlowdownSamples = tsMsSamples.map((tsMs, index) => {
    const pythonMs = pythonMsSamples[index]
    return typeof pythonMs === 'number' ? tsMs / pythonMs : Number.NaN
  })
  const slowdownStats = summaryStats(pairedSlowdownSamples)
  const slowdown = tsCase.time_ms / pythonCase.time_ms
  const gate = benchmarkCaseConfigByName.get(name)?.gate ?? 'release'
  const enforced = selectedCase ? true : gate === 'release'

  return {
    name,
    gate,
    enforced,
    python_ms: pythonCase.time_ms,
    ts_ms: tsCase.time_ms,
    python_ms_samples: pythonMsSamples,
    ts_ms_samples: tsMsSamples,
    paired_slowdown_samples: pairedSlowdownSamples,
    sample_stats: {
      python_ms: summaryStats(pythonMsSamples),
      ts_ms: summaryStats(tsMsSamples),
      slowdown: slowdownStats,
    },
    slowdown,
    speed_pass: slowdown <= maxSlowdown,
    checksum_pass,
    pass: slowdown <= maxSlowdown && checksum_pass,
    python_checksum: pythonCase.checksum,
    ts_checksum: tsCase.checksum,
    checksum_delta: tsCase.checksum - pythonCase.checksum,
  }
})

const checksumsPassed = rows.every((row) => row.checksum_pass)
const releaseRowsPassed = rows.every((row) => !row.enforced || row.pass)

const output = {
  timestamp: new Date().toISOString(),
  enforce,
  max_slowdown: maxSlowdown,
  sample_count: sampleCount,
  sampling: {
    strategy: 'paired-alternating-runtime-order-with-sample-process-isolation',
    case_isolation: 'cases share one runtime process per sample with per-case warmups',
    cases: benchmarkCaseNames,
    python_command: python,
    ts_command: `${process.execPath} run bench/python-parity/ts_bench.ts`,
    sample_pairs: samplePairs.map((pair) => ({
      index: pair.index,
      order: pair.order,
    })),
  },
  python: pythonReport,
  ts: tsReport,
  samples: {
    python: pythonSamples,
    ts: tsSamples,
  },
  rows,
  checksums_passed: checksumsPassed,
  release_rows_passed: releaseRowsPassed,
  passed: checksumsPassed && releaseRowsPassed,
}

const resultPath = join(root, 'bench/python-parity/results/latest.json')
const reportPath = join(root, 'bench/python-parity/results/latest.md')
mkdirSync(dirname(resultPath), { recursive: true })
writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`)
writeFileSync(reportPath, renderMarkdownReport(output))

console.log(
  `Python parity benchmark: max slowdown ${maxSlowdown.toFixed(2)}x, median of ${sampleCount} sample${sampleCount === 1 ? '' : 's'}`,
)
console.log('case                 gate         python ms   TS ms      slowdown   speed   checksum')
for (const row of rows) {
  console.log(
    `${row.name.padEnd(20)} ${row.gate.padEnd(11)} ${row.python_ms.toFixed(4).padStart(9)} ${row.ts_ms
      .toFixed(4)
      .padStart(10)} ${row.slowdown.toFixed(2).padStart(9)}x   ${
      row.speed_pass ? 'pass' : 'fail'
    }   ${row.checksum_pass ? 'pass' : 'fail'}`,
  )
}
console.log(`Result: ${output.passed ? 'pass' : 'fail'} (${resultPath})`)
console.log(`Report: ${reportPath}`)

if (!checksumsPassed || (enforce && !output.passed)) {
  process.exit(1)
}
