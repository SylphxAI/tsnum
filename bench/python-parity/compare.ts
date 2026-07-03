import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type BenchCase = {
  time_ms: number
  iterations: number
  warmup: number
  checksum: number
}

type BenchReport = {
  runtime: string
  benchmarks: Record<string, BenchCase>
}

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const enforce = process.argv.includes('--enforce')
const python = process.env.PYTHON ?? 'python3'
const maxSlowdown = Number(process.env.PYTHON_PARITY_MAX_SLOWDOWN ?? '1.05')
const checksumAtol = Number(process.env.PYTHON_PARITY_CHECKSUM_ATOL ?? '1e-6')
const checksumRtol = Number(process.env.PYTHON_PARITY_CHECKSUM_RTOL ?? '1e-9')

function checksumMatches(actual: number, expected: number): boolean {
  const tolerance = Math.max(checksumAtol, Math.abs(expected) * checksumRtol)
  return Math.abs(actual - expected) <= tolerance
}

function runJson(command: string[], cwd: string): BenchReport {
  const result = Bun.spawnSync(command, {
    cwd,
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

const pythonReport = runJson([python, 'bench/python-parity/python_bench.py'], root)
const tsReport = runJson([process.execPath, 'run', 'bench/python-parity/ts_bench.ts'], root)

const rows = Object.keys(pythonReport.benchmarks).map((name) => {
  const pythonCase = pythonReport.benchmarks[name]
  const tsCase = tsReport.benchmarks[name]
  if (!tsCase) {
    throw new Error(`Missing tsnum benchmark case: ${name}`)
  }

  const slowdown = tsCase.time_ms / pythonCase.time_ms
  const checksum_pass = checksumMatches(tsCase.checksum, pythonCase.checksum)
  return {
    name,
    python_ms: pythonCase.time_ms,
    ts_ms: tsCase.time_ms,
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

const output = {
  timestamp: new Date().toISOString(),
  enforce,
  max_slowdown: maxSlowdown,
  python: pythonReport,
  ts: tsReport,
  rows,
  checksums_passed: checksumsPassed,
  passed: rows.every((row) => row.pass),
}

const resultPath = join(root, 'bench/python-parity/results/latest.json')
mkdirSync(dirname(resultPath), { recursive: true })
writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`)

console.log(`Python parity benchmark: max slowdown ${maxSlowdown.toFixed(2)}x`)
console.log('case                 python ms   tsnum ms   slowdown   speed   checksum')
for (const row of rows) {
  console.log(
    `${row.name.padEnd(20)} ${row.python_ms.toFixed(4).padStart(9)} ${row.ts_ms
      .toFixed(4)
      .padStart(10)} ${row.slowdown.toFixed(2).padStart(9)}x   ${
      row.speed_pass ? 'pass' : 'fail'
    }   ${row.checksum_pass ? 'pass' : 'fail'}`,
  )
}
console.log(`Result: ${output.passed ? 'pass' : 'fail'} (${resultPath})`)

if (!checksumsPassed || (enforce && !output.passed)) {
  process.exit(1)
}
