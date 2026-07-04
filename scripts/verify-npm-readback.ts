#!/usr/bin/env bun

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type PackageManifest = {
  name?: string
  version?: string
}

const packagePath = join(process.cwd(), 'packages/tsnum/package.json')
const manifest = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageManifest

if (!manifest.name || !manifest.version) {
  throw new Error(`Missing package name or version in ${packagePath}`)
}

const selector = `${manifest.name}@${manifest.version}`
const result = Bun.spawnSync([process.execPath, 'pm', 'view', selector, 'version', '--json'], {
  stdout: 'pipe',
  stderr: 'pipe',
})

if (!result.success) {
  const stderr = new TextDecoder().decode(result.stderr).trim()
  const stdout = new TextDecoder().decode(result.stdout).trim()
  throw new Error(
    [
      `npm registry readback failed for ${selector}`,
      stdout ? `stdout:\n${stdout}` : '',
      stderr ? `stderr:\n${stderr}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  )
}

const output = new TextDecoder().decode(result.stdout).trim()
const version = JSON.parse(output) as string

if (version !== manifest.version) {
  throw new Error(`Registry readback mismatch for ${selector}: got ${version ?? 'missing'}`)
}

console.log(`npm registry readback passed: ${selector}`)
