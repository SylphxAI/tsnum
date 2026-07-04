import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type RuntimeBenchCase = {
  time_ms: number
  iterations: number
  warmup: number
  checksum: number
  time_ms_samples?: number[]
}

type RuntimeReport = {
  runtime: string
  bun?: string
  python?: string
  numpy?: string
  platform?: string
  arch?: string
  backend?: {
    name: string
    ready: boolean
    usingNativeBLAS: boolean
    usingWASM: boolean
  }
  native_blas_init?: {
    success: boolean
    error?: string
  }
  benchmarks: Record<string, RuntimeBenchCase>
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

type ComparisonRow = {
  name: string
  python_ms: number
  ts_ms: number
  python_ms_samples?: number[]
  ts_ms_samples?: number[]
  paired_slowdown_samples?: number[]
  sample_stats?: {
    python_ms: SummaryStats
    ts_ms: SummaryStats
    slowdown: SummaryStats
  }
  slowdown: number
  speed_pass: boolean
  checksum_pass: boolean
  pass: boolean
  python_checksum: number
  ts_checksum: number
  checksum_delta: number
}

type ComparisonReport = {
  timestamp: string
  enforce: boolean
  max_slowdown: number
  sample_count: number
  sampling?: {
    strategy: string
    case_isolation?: string
    cases?: string[]
    python_command: string
    ts_command: string
    sample_pairs: Array<{
      index: number
      order: Array<'python' | 'ts'>
    }>
  }
  python: RuntimeReport
  ts: RuntimeReport
  rows: ComparisonRow[]
  checksums_passed: boolean
  passed: boolean
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const resultPath = join(root, 'bench/python-parity/results/latest.json')
const reportPath = join(root, 'bench/python-parity/results/latest.md')

function formatMs(value: number): string {
  return Number.isFinite(value) ? value.toFixed(4) : 'unknown'
}

function formatSlowdown(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : 'unknown'
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : 'unknown'
}

function status(value: boolean): string {
  return value ? 'pass' : 'fail'
}

export function renderMarkdownReport(report: ComparisonReport): string {
  const backend = report.ts.backend
  const native = report.ts.native_blas_init
  const lines = [
    '# Python Parity Benchmark Report',
    '',
    `Generated: ${report.timestamp}`,
    '',
    '## Verdict',
    '',
    `- Overall: ${status(report.passed)}`,
    `- Checksum parity: ${status(report.checksums_passed)}`,
    `- Speed target: ${report.max_slowdown.toFixed(2)}x max slowdown`,
    `- Samples: median of ${report.sample_count}`,
    `- Sampling strategy: ${report.sampling?.strategy ?? 'sequential-runtime-order'}`,
    `- Case isolation: ${report.sampling?.case_isolation ?? 'none'}`,
    `- Enforcement mode: ${report.enforce ? 'on' : 'off'}`,
    '',
    '## Runtime',
    '',
    `- Python: ${report.python.python ?? 'unknown'}`,
    `- NumPy: ${report.python.numpy ?? 'unknown'}`,
    `- Bun: ${report.ts.bun ?? 'unknown'}`,
    `- Platform: ${report.ts.platform ?? report.python.platform ?? 'unknown'}`,
    `- Architecture: ${report.ts.arch ?? 'unknown'}`,
    `- @sylphx/numpy backend: ${backend?.name ?? 'unknown'}`,
    `- Native BLAS init: ${native?.success ? 'pass' : (native?.error ?? 'not reported')}`,
    `- Python command: ${report.sampling?.python_command ?? 'unknown'}`,
    `- TS command: ${report.sampling?.ts_command ?? 'unknown'}`,
    '',
    '## Sampling',
    '',
    `Cases: ${report.sampling?.cases?.join(', ') ?? report.rows.map((row) => row.name).join(', ')}`,
    '',
    '| Pair | Runtime order |',
    '| ---: | --- |',
    ...(report.sampling?.sample_pairs.map(
      (pair) => `| ${pair.index} | ${pair.order.join(' -> ')} |`,
    ) ?? ['| 1 | python -> ts |']),
    '',
    '## Cases',
    '',
    '| Case | Python median ms | Python p95 ms | Python RSD | @sylphx/numpy median ms | @sylphx/numpy p95 ms | @sylphx/numpy RSD | Slowdown | Paired slowdown p95 | Speed | Checksum |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
  ]

  for (const row of report.rows) {
    const pythonStats = row.sample_stats?.python_ms
    const tsStats = row.sample_stats?.ts_ms
    const slowdownStats = row.sample_stats?.slowdown

    lines.push(
      [
        `| ${row.name}`,
        formatMs(row.python_ms),
        formatMs(pythonStats?.p95 ?? row.python_ms),
        formatPercent(pythonStats?.relative_stddev ?? Number.NaN),
        formatMs(row.ts_ms),
        formatMs(tsStats?.p95 ?? row.ts_ms),
        formatPercent(tsStats?.relative_stddev ?? Number.NaN),
        formatSlowdown(row.slowdown),
        formatSlowdown(slowdownStats?.p95 ?? row.slowdown),
        status(row.speed_pass),
        `${status(row.checksum_pass)} |`,
      ].join(' | '),
    )
  }

  lines.push(
    '',
    '## Contract',
    '',
    '- Public speed claims require this report to pass with checksum parity and the configured slowdown target.',
    '- Slowdown is @sylphx/numpy median time divided by Python median time for each case.',
    '- Paired slowdown p95 is diagnostic runner-volatility evidence, not the release gate metric.',
    '- A failing speed row means full Python speed parity is not claimed for the covered operation.',
    '- Checksum parity is enforced on every benchmark run, including non-enforcing speed runs.',
    '',
  )

  return `${lines.join('\n')}\n`
}

function readReport(): ComparisonReport {
  if (!existsSync(resultPath)) {
    throw new Error(`Missing benchmark result JSON: ${resultPath}`)
  }

  return JSON.parse(readFileSync(resultPath, 'utf8')) as ComparisonReport
}

function main(): void {
  const check = process.argv.includes('--check')
  const report = readReport()
  const markdown = renderMarkdownReport(report)

  if (check) {
    if (!existsSync(reportPath)) {
      throw new Error(`Missing benchmark Markdown report: ${reportPath}`)
    }

    const current = readFileSync(reportPath, 'utf8')
    if (current !== markdown) {
      throw new Error(`Benchmark Markdown report is stale: ${reportPath}`)
    }

    if (!report.checksums_passed) {
      throw new Error('Benchmark checksum parity failed')
    }

    console.log(`Python parity report is fresh: ${reportPath}`)
    return
  }

  writeFileSync(reportPath, markdown)
  console.log(`Python parity report written: ${reportPath}`)
}

if (import.meta.main) {
  main()
}
