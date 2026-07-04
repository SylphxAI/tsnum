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

type ComparisonRow = {
  name: string
  python_ms: number
  ts_ms: number
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
  return value.toFixed(4)
}

function formatSlowdown(value: number): string {
  return `${value.toFixed(2)}x`
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
    `- Enforcement mode: ${report.enforce ? 'on' : 'off'}`,
    '',
    '## Runtime',
    '',
    `- Python: ${report.python.python ?? 'unknown'}`,
    `- NumPy: ${report.python.numpy ?? 'unknown'}`,
    `- Bun: ${report.ts.bun ?? 'unknown'}`,
    `- Platform: ${report.ts.platform ?? report.python.platform ?? 'unknown'}`,
    `- Architecture: ${report.ts.arch ?? 'unknown'}`,
    `- tsnum backend: ${backend?.name ?? 'unknown'}`,
    `- Native BLAS init: ${native?.success ? 'pass' : (native?.error ?? 'not reported')}`,
    '',
    '## Cases',
    '',
    '| Case | Python median ms | tsnum median ms | Slowdown | Speed | Checksum |',
    '| --- | ---: | ---: | ---: | --- | --- |',
  ]

  for (const row of report.rows) {
    lines.push(
      `| ${row.name} | ${formatMs(row.python_ms)} | ${formatMs(row.ts_ms)} | ${formatSlowdown(
        row.slowdown,
      )} | ${status(row.speed_pass)} | ${status(row.checksum_pass)} |`,
    )
  }

  lines.push(
    '',
    '## Contract',
    '',
    '- Public speed claims require this report to pass with checksum parity and the configured slowdown target.',
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
