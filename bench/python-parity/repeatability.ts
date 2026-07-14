import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Row = {
  name: string
  gate?: 'release' | 'diagnostic'
  enforced?: boolean
  slowdown: number
  speed_pass: boolean
  checksum_pass: boolean
  pass: boolean
}

type ParityReport = {
  timestamp: string
  passed: boolean
  max_slowdown: number
  checksums_passed: boolean
  rows: Row[]
}

type Attempt = {
  index: number
  exit_code: number
  passed: boolean
  checksums_passed: boolean
  failing_rows: Array<{
    name: string
    gate?: 'release' | 'diagnostic'
    slowdown: number
    speed_pass: boolean
    checksum_pass: boolean
  }>
  report_timestamp?: string
  rows: Row[]
}

type ReleaseRowSummary = {
  name: string
  attempts: number
  pass_count: number
  required_pass_count: number
  median_slowdown: number
  max_slowdown: number
  max_allowed_slowdown: number
  passed: boolean
  slowdowns: number[]
}

function readPositiveInt(name: string, fallback: number): number {
  const configured = Number(process.env[name])
  if (!Number.isFinite(configured)) {
    return fallback
  }
  return Math.max(1, Math.trunc(configured))
}

function readPositiveNumber(name: string, fallback: number): number {
  const configured = Number(process.env[name])
  if (!Number.isFinite(configured) || configured <= 0) {
    return fallback
  }
  return configured
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const attempts = readPositiveInt('PYTHON_PARITY_REPEAT_ATTEMPTS', 3)
const warmupAttempts = readPositiveInt('PYTHON_PARITY_REPEAT_WARMUP_ATTEMPTS', 2)
const maxAllowedOutlierSlowdown = readPositiveNumber('PYTHON_PARITY_REPEAT_MAX_SLOWDOWN', 1.1)
const resultPath = join(root, 'bench/python-parity/results/latest.json')
const repeatabilityJsonPath = join(root, 'bench/python-parity/results/repeatability-latest.json')
const repeatabilityMarkdownPath = join(root, 'bench/python-parity/results/repeatability-latest.md')

function readLatestReport(): ParityReport {
  return JSON.parse(readFileSync(resultPath, 'utf8')) as ParityReport
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[middle]
  }
  return (sorted[middle - 1] + sorted[middle]) / 2
}

function writeRepeatabilityReport(summary: {
  timestamp: string
  warmup_attempts: number
  attempts_required: number
  required_pass_count: number
  max_slowdown: number
  max_allowed_outlier_slowdown: number
  passed: boolean
  attempts: Attempt[]
  release_rows: ReleaseRowSummary[]
}): void {
  mkdirSync(dirname(repeatabilityJsonPath), { recursive: true })
  writeFileSync(repeatabilityJsonPath, `${JSON.stringify(summary, null, 2)}\n`)

  const lines = [
    '# Python Parity Repeatability Report',
    '',
    `Generated: ${summary.timestamp}`,
    '',
    '## Verdict',
    '',
    `- Overall: ${summary.passed ? 'pass' : 'fail'}`,
    `- Warmup attempts: ${summary.warmup_attempts}`,
    `- Attempts required: ${summary.attempts_required}`,
    `- Release row pass quorum: ${summary.required_pass_count}/${summary.attempts_required}`,
    `- Release median slowdown target: ${summary.max_slowdown.toFixed(2)}x`,
    `- Release outlier slowdown cap: ${summary.max_allowed_outlier_slowdown.toFixed(2)}x`,
    '',
    '## Attempts',
    '',
    '| Attempt | Result | Failing rows |',
    '| ---: | --- | --- |',
    ...summary.attempts.map((attempt) => {
      const failingRows =
        attempt.failing_rows.length === 0
          ? 'none'
          : attempt.failing_rows
              .map((row) => `${row.name} (${row.slowdown.toFixed(2)}x)`)
              .join(', ')
      return `| ${attempt.index} | ${attempt.passed ? 'pass' : 'fail'} | ${failingRows} |`
    }),
    '',
    '## Release Row Gate',
    '',
    '| Row | Result | Pass count | Median slowdown | Max slowdown | Attempt slowdowns |',
    '| --- | --- | ---: | ---: | ---: | --- |',
    ...summary.release_rows.map((row) => {
      const slowdowns = row.slowdowns.map((slowdown) => `${slowdown.toFixed(2)}x`).join(', ')
      return `| ${row.name} | ${row.passed ? 'pass' : 'fail'} | ${row.pass_count}/${row.attempts} | ${row.median_slowdown.toFixed(2)}x | ${row.max_slowdown.toFixed(2)}x | ${slowdowns} |`
    }),
    '',
    '## Contract',
    '',
    '- Warmup attempts run the same comparison path without enforcement and are not release proof.',
    '- Release speed parity requires checksum parity on every attempt.',
    '- Each release row must pass all but at most one enforced attempt.',
    '- Each release row median slowdown across enforced attempts must stay within the configured release target.',
    '- Each release row max slowdown across enforced attempts must stay within the configured outlier cap.',
    '- Each attempt runs `bench/python-parity/compare.ts --enforce` with the configured benchmark environment.',
    '- Individual outlier attempts are reported as volatility evidence, not hidden from the gate.',
    '- A single favorable artifact is not release evidence without the full repeatability summary.',
  ]
  writeFileSync(repeatabilityMarkdownPath, `${lines.join('\n')}\n`)
}

const attemptResults: Attempt[] = []

for (let index = 1; index <= warmupAttempts; index++) {
  console.log(`\npython parity repeatability: warmup ${index}/${warmupAttempts}`)
  const result = Bun.spawnSync([process.execPath, 'run', 'bench/python-parity/compare.ts'], {
    cwd: root,
    env: process.env,
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const stdout = new TextDecoder().decode(result.stdout).trim()
  const stderr = new TextDecoder().decode(result.stderr).trim()
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)

  if (!result.success) {
    process.exit(result.exitCode ?? 1)
  }
}

for (let index = 1; index <= attempts; index++) {
  console.log(`\npython parity repeatability: attempt ${index}/${attempts}`)
  const result = Bun.spawnSync(
    [process.execPath, 'run', 'bench/python-parity/compare.ts', '--enforce'],
    {
      cwd: root,
      env: process.env,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  )

  const stdout = new TextDecoder().decode(result.stdout).trim()
  const stderr = new TextDecoder().decode(result.stderr).trim()
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)

  const report = readLatestReport()
  const failingRows = report.rows
    .filter((row) => (row.enforced ?? true) && !row.pass)
    .map((row) => ({
      name: row.name,
      gate: row.gate,
      slowdown: row.slowdown,
      speed_pass: row.speed_pass,
      checksum_pass: row.checksum_pass,
    }))

  attemptResults.push({
    index,
    exit_code: result.exitCode ?? (result.success ? 0 : 1),
    passed: result.success && report.passed,
    checksums_passed: report.checksums_passed,
    failing_rows: failingRows,
    report_timestamp: report.timestamp,
    rows: report.rows,
  })
}

const requiredPassCount = Math.max(1, attempts - 1)
const maxSlowdown = readLatestReport().max_slowdown
const releaseRowNames = Array.from(
  new Set(
    attemptResults.flatMap((attempt) =>
      attempt.rows.filter((row) => row.enforced ?? true).map((row) => row.name),
    ),
  ),
)
const releaseRows: ReleaseRowSummary[] = releaseRowNames.map((name) => {
  const rows = attemptResults.map((attempt) => {
    const row = attempt.rows.find((candidate) => candidate.name === name)
    if (!row) {
      throw new Error(`Missing release row in repeatability attempt ${attempt.index}: ${name}`)
    }
    return row
  })
  const slowdowns = rows.map((row) => row.slowdown)
  const passCount = rows.filter((row) => row.pass).length
  const medianSlowdown = median(slowdowns)
  const maxObservedSlowdown = Math.max(...slowdowns)

  return {
    name,
    attempts,
    pass_count: passCount,
    required_pass_count: requiredPassCount,
    median_slowdown: medianSlowdown,
    max_slowdown: maxObservedSlowdown,
    max_allowed_slowdown: maxAllowedOutlierSlowdown,
    passed:
      passCount >= requiredPassCount &&
      medianSlowdown <= maxSlowdown &&
      maxObservedSlowdown <= maxAllowedOutlierSlowdown &&
      rows.every((row) => row.checksum_pass),
    slowdowns,
  }
})

const summary = {
  timestamp: new Date().toISOString(),
  warmup_attempts: warmupAttempts,
  attempts_required: attempts,
  required_pass_count: requiredPassCount,
  max_slowdown: maxSlowdown,
  max_allowed_outlier_slowdown: maxAllowedOutlierSlowdown,
  passed:
    attemptResults.every((attempt) => attempt.checksums_passed) &&
    releaseRows.every((row) => row.passed),
  attempts: attemptResults,
  release_rows: releaseRows,
}

writeRepeatabilityReport(summary)

console.log(`\nRepeatability JSON: ${repeatabilityJsonPath}`)
console.log(`Repeatability Markdown: ${repeatabilityMarkdownPath}`)
console.log(`Result: ${summary.passed ? 'pass' : 'fail'}`)

if (!summary.passed) {
  process.exit(1)
}
