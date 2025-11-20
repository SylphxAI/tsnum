import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { add, div, mean, mul, std, sub, sum, variance } from '../ops'
import { getBackend, initWASM } from './manager'
import { WASMBackend } from './wasm'

describe('WASM Backend', () => {
  test('WASMBackend can be initialized', async () => {
    const backend = new WASMBackend()
    expect(backend.isReady).toBe(false)

    await backend.init()

    expect(backend.isReady).toBe(true)
    expect(backend.name).toBe('wasm')
  })

  test('WASM backend arithmetic operations', async () => {
    const backend = new WASMBackend()
    await backend.init()

    // Create test data
    const a = array([1, 2, 3, 4]).getData()
    const b = array([10, 20, 30, 40]).getData()

    // Test add_arrays
    const addResult = backend.add(a, b)
    expect(Array.from(addResult.buffer)).toEqual([11, 22, 33, 44])

    // Test add_scalar
    const addScalarResult = backend.add(a, 100)
    expect(Array.from(addScalarResult.buffer)).toEqual([101, 102, 103, 104])

    // Test sub
    const subResult = backend.sub(b, a)
    expect(Array.from(subResult.buffer)).toEqual([9, 18, 27, 36])

    // Test mul
    const mulResult = backend.mul(a, b)
    expect(Array.from(mulResult.buffer)).toEqual([10, 40, 90, 160])

    // Test div
    const divResult = backend.div(b, a)
    expect(Array.from(divResult.buffer)).toEqual([10, 10, 10, 10])

    // Test pow
    const powResult = backend.pow(array([2, 3, 4]).getData(), 2)
    expect(Array.from(powResult.buffer)).toEqual([4, 9, 16])
  })

  test('WASM backend reduction operations', async () => {
    const backend = new WASMBackend()
    await backend.init()

    const a = array([1, 2, 3, 4, 5]).getData()

    expect(backend.sum(a)).toBe(15)
    expect(backend.mean(a)).toBe(3)
    expect(backend.max(a)).toBe(5)
    expect(backend.min(a)).toBe(1)

    // Test variance and std
    const testData = array([2, 4, 6, 8]).getData()
    expect(backend.variance(testData)).toBe(5)
    expect(backend.std(testData)).toBeCloseTo(Math.sqrt(5), 10)
  })

  test('WASM backend broadcasting', async () => {
    const backend = new WASMBackend()
    await backend.init()

    // 2D + 1D broadcasting
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ]).getData() // (2, 3)
    const b = array([10, 20, 30]).getData() // (3,)

    const result = backend.add(a, b)

    expect(result.shape).toEqual([2, 3])
    // Row 1: [11, 22, 33], Row 2: [14, 25, 36]
    expect(Array.from(result.buffer)).toEqual([11, 22, 33, 14, 25, 36])
  })

  test('initWASM() switches to WASM backend', async () => {
    // Should start with TypeScript backend
    let info = getBackend()
    expect(info.name).toBe('typescript')

    // Initialize WASM
    const result = await initWASM()

    expect(result.success).toBe(true)
    expect(result.backend?.name).toBe('wasm')

    // Verify backend switched
    info = getBackend()
    expect(info.name).toBe('wasm')

    // Verify operations work through WASM
    const a = array([1, 2, 3])
    const b = add(a, 10)
    expect(sum(b)).toBe(36) // [11, 12, 13] -> 36
  })

  test('WASM backend matches TypeScript backend results', async () => {
    const backend = new WASMBackend()
    await backend.init()

    // Test data
    const testCases = [
      array([1, 2, 3, 4, 5]),
      array([10.5, 20.3, 30.7]),
      array([
        [1, 2],
        [3, 4],
      ]),
      array([
        [-5, -10],
        [15, 20],
      ]),
    ]

    for (const arr of testCases) {
      const data = arr.getData()

      // Compare reductions (WASM should match TS exactly)
      expect(backend.sum(data)).toBeCloseTo(sum(arr), 10)
      expect(backend.mean(data)).toBeCloseTo(mean(arr), 10)
      expect(backend.max(data)).toBeCloseTo(Math.max(...arr.getData().buffer), 10)
      expect(backend.min(data)).toBeCloseTo(Math.min(...arr.getData().buffer), 10)
      expect(backend.variance(data)).toBeCloseTo(variance(arr), 10)
      expect(backend.std(data)).toBeCloseTo(std(arr), 10)
    }
  })

  test('WASM backend handles different dtypes', async () => {
    const backend = new WASMBackend()
    await backend.init()

    // Test with int32
    const a = array([1, 2, 3], { dtype: 'int32' }).getData()
    const result = backend.add(a, 10)

    expect(result.dtype).toBe('int32')
    expect(Array.from(result.buffer)).toEqual([11, 12, 13])

    // Test with float32
    const b = array([1.5, 2.5, 3.5], { dtype: 'float32' }).getData()
    const result2 = backend.mul(b, 2)

    expect(result2.dtype).toBe('float32')
    expect(Array.from(result2.buffer)).toEqual([3, 5, 7])
  })
})
