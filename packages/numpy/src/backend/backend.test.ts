import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { add, mul, sum } from '../ops'
import { backendManager, getBackendInfo } from './manager'

describe('Backend System', () => {
  beforeEach(() => {
    backendManager.useTypeScript()
  })

  afterEach(() => {
    backendManager.useTypeScript()
  })

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
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ]) // (2, 3)
    const b = array([10, 20, 30]) // (3,)
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
    expect(info).toHaveProperty('usingNativeBLAS')
    expect(info).toHaveProperty('usingWASM')

    expect(['native-blas', 'wasm', 'typescript']).toContain(info.name)
    expect(typeof info.ready).toBe('boolean')
    expect(typeof info.usingNativeBLAS).toBe('boolean')
    expect(typeof info.usingWASM).toBe('boolean')
  })
})

const nativeBLASTest =
  typeof Bun !== 'undefined' && process.platform === 'darwin' ? test : test.skip

describe('Native BLAS backend', () => {
  nativeBLASTest('Native kernels preserve float64 operation semantics', async () => {
    const { NativeBLASBackend } = await import('./native-blas')
    const backend = new NativeBLASBackend()

    const a = array([1, 2, 3], { dtype: 'float64' }).getData()
    const b = array([4, 5, 6], { dtype: 'float64' }).getData()

    expect(Array.from(backend.add(a, b).buffer)).toEqual([5, 7, 9])
    expect(Array.from(backend.add(a, 10).buffer)).toEqual([11, 12, 13])
    expect(Array.from(backend.mul(a, 2).buffer)).toEqual([2, 4, 6])

    const addOut = array([0, 0, 0], { dtype: 'float64' }).getData()
    const mulOut = array([0, 0, 0], { dtype: 'float64' }).getData()
    expect(backend.addInto(a, b, addOut)).toBe(addOut)
    expect(backend.mulInto(a, 2, mulOut)).toBe(mulOut)
    expect(Array.from(addOut.buffer)).toEqual([5, 7, 9])
    expect(Array.from(mulOut.buffer)).toEqual([2, 4, 6])

    expect(backend.sum(a)).toBe(6)
    expect(backend.mean(a)).toBe(2)
  })

  nativeBLASTest('Accelerate matmul and transpose match row-major outputs', async () => {
    const { NativeBLASBackend } = await import('./native-blas')
    const backend = new NativeBLASBackend()

    const a = array(
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      { dtype: 'float64' },
    ).getData()
    const b = array(
      [
        [7, 8],
        [9, 10],
        [11, 12],
      ],
      { dtype: 'float64' },
    ).getData()

    const product = backend.matmul(a, b)
    expect(product.shape).toEqual([2, 2])
    expect(Array.from(product.buffer)).toEqual([58, 64, 139, 154])

    const transposed = backend.transpose(a)
    expect(transposed.shape).toEqual([3, 2])
    expect(Array.from(transposed.buffer)).toEqual([1, 4, 2, 5, 3, 6])
  })
})
