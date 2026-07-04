#!/usr/bin/env bun

type Step = {
  name: string
  command: string[]
}

const steps: Step[] = [
  {
    name: 'Install locked dependencies',
    command: [process.execPath, 'install', '--frozen-lockfile'],
  },
  {
    name: 'Build packages',
    command: [process.execPath, 'run', 'build'],
  },
  {
    name: 'Run tests',
    command: [process.execPath, 'run', 'test'],
  },
  {
    name: 'Enforce Python parity benchmark',
    command: [process.execPath, 'run', 'bench:python-parity:enforce'],
  },
]

for (const step of steps) {
  console.log(`\nrelease preflight: ${step.name}`)
  const result = Bun.spawnSync(step.command, {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })

  if (!result.success) {
    console.error(`release preflight failed: ${step.command.join(' ')}`)
    process.exit(result.exitCode ?? 1)
  }
}

console.log('\nrelease preflight passed')
