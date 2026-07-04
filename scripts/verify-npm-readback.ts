#!/usr/bin/env bun

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

type PackageManifest = {
  name?: string
  private?: boolean
  version?: string
}

type PublicPackage = {
  manifest: PackageManifest
  packagePath: string
}

function readJson(path: string): PackageManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest
}

function publicWorkspacePackages(): PublicPackage[] {
  const packagesDir = join(process.cwd(), 'packages')
  const packages: PublicPackage[] = []

  for (const entry of readdirSync(packagesDir)) {
    const packagePath = join(packagesDir, entry, 'package.json')
    try {
      if (!statSync(packagePath).isFile()) continue
    } catch {
      continue
    }

    const manifest = readJson(packagePath)
    if (!manifest.private) {
      packages.push({ manifest, packagePath })
    }
  }

  return packages.toSorted((left, right) =>
    String(left.manifest.name).localeCompare(String(right.manifest.name)),
  )
}

const packages = publicWorkspacePackages()

if (packages.length === 0) {
  throw new Error('No public workspace packages found for npm registry readback')
}

for (const { manifest, packagePath } of packages) {
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
}

console.log(
  `npm registry readback passed for ${packages.length} package${packages.length === 1 ? '' : 's'}`,
)
