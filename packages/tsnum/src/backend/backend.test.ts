import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { add, mul, sum } from '../ops'
import { getBackendInfo } from './manager'

describe('Backend System', () => {
  test('TypeScript backend is active by default', () => {
    const info = getBackendInfo()
    expect(info.name).toBe('typescript')
    expect(info.ready).toBe(true)
    expect(info.usingWASM).toBe(false)
  })

  test('Operations work with TypeScript backend', () => {
    const a = array([1, 2, 3])
    const b = array([4, 5, 6])
    const result = add(a, b)

    expect(sum(result)).toBe(21) // [5, 7, 9] -> 21
  })

  test('Broadcasting works with TypeScript backend', () => {
    const a = array([[1, 2, 3], [4, 5, 6]])  // (2, 3)
    const b = array([10, 20, 30])  // (3,)
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    // Row 1: 11+22+33=66, Row 2: 14+25+36=75, Total: 141
    expect(sum(result)).toBe(141)
  })

  test('Scalar operations work', () => {
    const a = array([1, 2, 3])
    const result = mul(a, 10)

    expect(sum(result)).toBe(60) // [10, 20, 30] -> 60
  })

  test('Reductions work', () => {
    const a = array([2, 4, 6, 8])
    expect(sum(a)).toBe(20)
  })
})

describe('Backend Info', () => {
  test('getBackendInfo returns correct structure', () => {
    const info = getBackendInfo()

    expect(info).toHaveProperty('name')
    expect(info).toHaveProperty('ready')
    expect(info).toHaveProperty('usingWASM')

    expect(['wasm', 'typescript']).toContain(info.name)
    expect(typeof info.ready).toBe('boolean')
    expect(typeof info.usingWASM).toBe('boolean')
  })
})
