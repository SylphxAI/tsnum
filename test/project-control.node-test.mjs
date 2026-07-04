import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const readText = (path) => readFileSync(path, 'utf8')

test('project manifest is the vendor-neutral GroundAtlas control file', () => {
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
        surface.description.includes('not the vendor-neutral GroundAtlas default'),
    ),
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
  assert.ok(doctrine.delivery.ciModel.includes('groundatlas'))
  assert.ok(doctrine.delivery.productionProof.includes('GroundAtlas package dogfood'))
  assert.ok(doctrine.delivery.packageRelease.publishProof.includes('release:readback'))
  assert.ok(doctrine.adoption.gaps.some((gap) => gap.id === 'release-workflow-unproven'))
})

test('CI runs project-control and dogfoods the released GroundAtlas package/action', () => {
  const workflow = readText('.github/workflows/ci.yml')

  assert.ok(workflow.includes('node --test test/project-control.node-test.mjs'))
  assert.ok(workflow.includes('uses: SylphxAI/groundatlas@v0.1.2'))
  assert.ok(workflow.includes('package-spec: groundatlas@0.1.2'))
  assert.ok(workflow.includes('require-atlas: "true"'))
  assert.ok(workflow.includes('strict: "true"'))
  assert.ok(workflow.includes('project.manifest.json'))
  assert.ok(workflow.includes('.doctrine/project.json'))
})

test('package scripts expose reproducible local project-control gates', () => {
  const pkg = readJson('package.json')

  assert.equal(
    pkg.scripts['test:project-control'],
    'node --test test/project-control.node-test.mjs',
  )
  assert.equal(
    pkg.scripts['groundatlas:fleet'],
    'npm exec --yes --package groundatlas@0.1.2 -- ga fleet . --out .groundatlas-pilot --require-atlas --strict --json',
  )
  assert.equal(
    pkg.scripts.release,
    'echo "Direct changeset publish is unsafe for workspace packages; use the Sylphx release workflow." && exit 1',
  )
})
