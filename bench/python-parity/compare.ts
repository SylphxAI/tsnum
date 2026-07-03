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
  return {
    name,
    python_ms: pythonCase.time_ms,
    ts_ms: tsCase.time_ms,
    slowdown,
    pass: slowdown <= maxSlowdown,
    python_checksum: pythonCase.checksum,
    ts_checksum: tsCase.checksum,
  }
})

const output = {
  timestamp: new Date().toISOString(),
  enforce,
  max_slowdown: maxSlowdown,
  python: pythonReport,
  ts: tsReport,
  rows,
  passed: rows.every((row) => row.pass),
}

const resultPath = join(root, 'bench/python-parity/results/latest.json')
mkdirSync(dirname(resultPath), { recursive: true })
writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`)

console.log(`Python parity benchmark: max slowdown ${maxSlowdown.toFixed(2)}x`)
console.log('case                 python ms   tsnum ms   slowdown   status')
for (const row of rows) {
  console.log(
    `${row.name.padEnd(20)} ${row.python_ms.toFixed(4).padStart(9)} ${row.ts_ms
      .toFixed(4)
      .padStart(10)} ${row.slowdown.toFixed(2).padStart(9)}x   ${row.pass ? 'pass' : 'fail'}`,
  )
}
console.log(`Result: ${output.passed ? 'pass' : 'fail'} (${resultPath})`)

if (enforce && !output.passed) {
  process.exit(1)
}
