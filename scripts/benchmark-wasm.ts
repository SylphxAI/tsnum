#!/usr/bin/env bun
/**
 * Performance comparison: WASM vs TypeScript backend
 */

import { TypeScriptBackend } from '../packages/tsnum/src/backend/typescript'
import { WASMBackend } from '../packages/tsnum/src/backend/wasm'
import { array } from '../packages/tsnum/src/creation'

// Benchmark helper
function benchmark(name: string, fn: () => void, iterations = 1000) {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  const total = end - start
  const avg = total / iterations
  return { name, total, avg, iterations }
}

async function main() {
  console.log('🚀 WASM vs TypeScript Backend Performance Comparison\n')

  // Initialize backends
  const tsBackend = new TypeScriptBackend()
  const wasmBackend = new WASMBackend()

  console.log('Initializing WASM backend...')
  await wasmBackend.init()
  console.log('✓ WASM backend ready\n')

  // Test data
  const small = array(Array.from({ length: 100 }, (_, i) => i)).getData()
  const medium = array(Array.from({ length: 10000 }, (_, i) => i)).getData()
  const large = array(Array.from({ length: 100000 }, (_, i) => i)).getData()

  // Run benchmarks
  console.log('=== Small Arrays (100 elements) ===')
  const smallResults = [
    benchmark('TS: add scalar', () => tsBackend.add(small, 42), 10000),
    benchmark('WASM: add scalar', () => wasmBackend.add(small, 42), 10000),
    benchmark('TS: sum', () => tsBackend.sum(small), 10000),
    benchmark('WASM: sum', () => wasmBackend.sum(small), 10000),
  ]
  printResults(smallResults)

  console.log('\n=== Medium Arrays (10K elements) ===')
  const mediumResults = [
    benchmark('TS: add scalar', () => tsBackend.add(medium, 42), 1000),
    benchmark('WASM: add scalar', () => wasmBackend.add(medium, 42), 1000),
    benchmark('TS: mul scalar', () => tsBackend.mul(medium, 2.5), 1000),
    benchmark('WASM: mul scalar', () => wasmBackend.mul(medium, 2.5), 1000),
    benchmark('TS: sum', () => tsBackend.sum(medium), 1000),
    benchmark('WASM: sum', () => wasmBackend.sum(medium), 1000),
    benchmark('TS: variance', () => tsBackend.variance(medium), 1000),
    benchmark('WASM: variance', () => wasmBackend.variance(medium), 1000),
  ]
  printResults(mediumResults)

  console.log('\n=== Large Arrays (100K elements) ===')
  const largeResults = [
    benchmark('TS: add scalar', () => tsBackend.add(large, 42), 100),
    benchmark('WASM: add scalar', () => wasmBackend.add(large, 42), 100),
    benchmark('TS: sum', () => tsBackend.sum(large), 100),
    benchmark('WASM: sum', () => wasmBackend.sum(large), 100),
    benchmark('TS: variance', () => tsBackend.variance(large), 100),
    benchmark('WASM: variance', () => wasmBackend.variance(large), 100),
  ]
  printResults(largeResults)

  // Array operations
  console.log('\n=== Array Operations (1K elements) ===')
  const a = array(Array.from({ length: 1000 }, (_, i) => i)).getData()
  const b = array(Array.from({ length: 1000 }, (_, i) => i * 2)).getData()
  const arrayResults = [
    benchmark('TS: add arrays', () => tsBackend.add(a, b), 1000),
    benchmark('WASM: add arrays', () => wasmBackend.add(a, b), 1000),
    benchmark('TS: mul arrays', () => tsBackend.mul(a, b), 1000),
    benchmark('WASM: mul arrays', () => wasmBackend.mul(a, b), 1000),
  ]
  printResults(arrayResults)

  console.log('\n✅ Benchmark complete!')
}

function printResults(
  results: Array<{ name: string; total: number; avg: number; iterations: number }>,
) {
  const maxNameLen = Math.max(...results.map((r) => r.name.length))

  for (const result of results) {
    const name = result.name.padEnd(maxNameLen)
    const avg = result.avg.toFixed(3).padStart(8)
    const total = result.total.toFixed(2).padStart(10)
    console.log(`  ${name}  ${avg} ms/op  (${total} ms total, ${result.iterations} iterations)`)
  }

  // Calculate speedup for paired results (TS vs WASM)
  for (let i = 0; i < results.length; i += 2) {
    if (i + 1 < results.length) {
      const ts = results[i]
      const wasm = results[i + 1]
      const speedup = ts.avg / wasm.avg
      const faster = speedup > 1 ? 'WASM faster' : 'TS faster'
      const factor = speedup > 1 ? speedup : 1 / speedup
      console.log(`  → ${faster}: ${factor.toFixed(2)}x`)
    }
  }
}

main().catch(console.error)
