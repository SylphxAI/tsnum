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
}

function readPositiveInt(name: string, fallback: number): number {
  const configured = Number(process.env[name])
  if (!Number.isFinite(configured)) {
    return fallback
  }
  return Math.max(1, Math.trunc(configured))
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const attempts = readPositiveInt('PYTHON_PARITY_REPEAT_ATTEMPTS', 3)
const warmupAttempts = readPositiveInt('PYTHON_PARITY_REPEAT_WARMUP_ATTEMPTS', 2)
const resultPath = join(root, 'bench/python-parity/results/latest.json')
const repeatabilityJsonPath = join(root, 'bench/python-parity/results/repeatability-latest.json')
const repeatabilityMarkdownPath = join(root, 'bench/python-parity/results/repeatability-latest.md')

function readLatestReport(): ParityReport {
  return JSON.parse(readFileSync(resultPath, 'utf8')) as ParityReport
}

function writeRepeatabilityReport(summary: {
  timestamp: string
  warmup_attempts: number
  attempts_required: number
  passed: boolean
  attempts: Attempt[]
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
    '## Contract',
    '',
    '- Warmup attempts run the same comparison path without enforcement and are not release proof.',
    '- Release speed parity requires every repeatability attempt to pass.',
    '- Each attempt runs `bench/python-parity/compare.ts --enforce` with the configured benchmark environment.',
    '- A single favorable artifact is not release evidence when later attempts fail.',
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
  })
}

const summary = {
  timestamp: new Date().toISOString(),
  warmup_attempts: warmupAttempts,
  attempts_required: attempts,
  passed: attemptResults.every((attempt) => attempt.passed),
  attempts: attemptResults,
}

writeRepeatabilityReport(summary)

console.log(`\nRepeatability JSON: ${repeatabilityJsonPath}`)
console.log(`Repeatability Markdown: ${repeatabilityMarkdownPath}`)
console.log(`Result: ${summary.passed ? 'pass' : 'fail'}`)

if (!summary.passed) {
  process.exit(1)
}
