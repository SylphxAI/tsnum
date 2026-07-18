import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const readText = (path) => readFileSync(path, 'utf8')

test('project manifest remains valid project metadata without GroundAtlas product dogfood', () => {
  const manifest = readJson('project.manifest.json')

  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.project.id, 'tsnum')
  assert.equal(manifest.project.repository, 'https://github.com/SylphxAI/tsnum')
  assert.equal(manifest.project.visibility, 'open-source')
  assert.equal(manifest.project.lifecycle, 'active')
  assert.equal(manifest.adoption.status, 'adopted')
  assert.equal(manifest.truth.agentAdapter, 'AGENTS.md')
  assert.ok(manifest.truth.specs.includes('docs/specs/project-control-gate.md'))
  assert.ok(manifest.truth.specs.includes('bench/python-parity/results/latest.md'))
  assert.ok(manifest.truth.adrs.includes('docs/adr/0001-python-parity-launch-contract.md'))
  assert.ok(
    manifest.surfaces.some(
      (surface) =>
        surface.path === '.doctrine/project.json' &&
        surface.description.toLowerCase().includes('adapter'),
    ),
  )
  const commandNames = (manifest.commands || []).map((c) => c.name)
  assert.ok(!commandNames.includes('groundatlas:fleet'))
  assert.ok(
    String(manifest.adoption?.notes || '').includes('ADR-0014') ||
      String(manifest.adoption?.notes || '').toLowerCase().includes('retired'),
  )
})

test('Doctrine adapter remains Sylphx-specific and release boundary is explicit', () => {
  const doctrine = readJson('.doctrine/project.json')

  assert.equal(doctrine.project.repo, 'SylphxAI/tsnum')
  assert.equal(doctrine.adoption.status, 'adopted')
  assert.ok(
    doctrine.boundaries.publicSurfaces.some(
      (surface) => surface.type === 'manifest' && surface.location === 'project.manifest.json',
    ),
  )
  // GroundAtlas dogfood retired (CP ADR-0014) — do not require groundatlas strings.
  assert.ok(!String(doctrine.delivery?.ciModel || '').toLowerCase().includes('groundatlas'))
  assert.ok(doctrine.delivery.packageRelease.publishProof.includes('release:readback'))
  assert.ok(doctrine.adoption.gaps.some((gap) => gap.id === 'release-workflow-unproven'))
})

test('CI runs project-control and does not pin GroundAtlas package/action', () => {
  const workflow = readText('.github/workflows/ci.yml')

  assert.ok(workflow.includes('node --test test/project-control.node-test.mjs'))
  assert.ok(!workflow.includes('uses: SylphxAI/groundatlas@'))
  assert.ok(!workflow.includes('package-spec: groundatlas@'))
  assert.ok(workflow.includes('project.manifest.json') || workflow.includes('project-control'))
})

test('package scripts expose project-control without groundatlas:fleet', () => {
  const pkg = readJson('package.json')

  assert.equal(
    pkg.scripts['test:project-control'],
    'node --test test/project-control.node-test.mjs',
  )
  assert.equal(pkg.scripts['groundatlas:fleet'], undefined)
  assert.equal(
    pkg.scripts.release,
    'echo "Direct changeset publish is unsafe for workspace packages; use the Sylphx release workflow." && exit 1',
  )
})
