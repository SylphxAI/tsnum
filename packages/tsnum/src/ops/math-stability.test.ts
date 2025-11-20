import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { exp2, expm1, log1p, log2 } from './math'

describe('Numerical Stability Math Functions', () => {
  describe('exp2', () => {
    test('exp2 - integer powers', () => {
      const arr = array([0, 1, 2, 3, 4])
      const result = exp2(arr)
      const data = result.getData()

      expect(data.shape).toEqual([5])
      expect(data.buffer[0]).toBeCloseTo(1)
      expect(data.buffer[1]).toBeCloseTo(2)
      expect(data.buffer[2]).toBeCloseTo(4)
      expect(data.buffer[3]).toBeCloseTo(8)
      expect(data.buffer[4]).toBeCloseTo(16)
    })

    test('exp2 - negative powers', () => {
      const arr = array([-1, -2, -3])
      const result = exp2(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0.5)
      expect(data.buffer[1]).toBeCloseTo(0.25)
      expect(data.buffer[2]).toBeCloseTo(0.125)
    })

    test('exp2 - fractional powers', () => {
      const arr = array([0.5, 1.5, 2.5], { dtype: 'float64' })
      const result = exp2(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(Math.sqrt(2))
      expect(data.buffer[1]).toBeCloseTo(Math.sqrt(2) * 2)
      expect(data.buffer[2]).toBeCloseTo(Math.sqrt(2) * 4)
    })

    test('exp2 - zero', () => {
      const arr = array([0])
      const result = exp2(arr)

      expect(result.getData().buffer[0]).toBeCloseTo(1)
    })

    test('exp2 - 2D array', () => {
      const arr = array([
        [0, 1],
        [2, 3],
      ])
      const result = exp2(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(Array.from(data.buffer)).toEqual([1, 2, 4, 8])
    })
  })

  describe('log2', () => {
    test('log2 - integer powers', () => {
      const arr = array([1, 2, 4, 8, 16])
      const result = log2(arr)
      const data = result.getData()

      expect(data.shape).toEqual([5])
      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(1)
      expect(data.buffer[2]).toBeCloseTo(2)
      expect(data.buffer[3]).toBeCloseTo(3)
      expect(data.buffer[4]).toBeCloseTo(4)
    })

    test('log2 - fractional values', () => {
      const arr = array([0.5, 0.25, 0.125], { dtype: 'float64' })
      const result = log2(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(-1)
      expect(data.buffer[1]).toBeCloseTo(-2)
      expect(data.buffer[2]).toBeCloseTo(-3)
    })

    test('log2 - one', () => {
      const arr = array([1])
      const result = log2(arr)

      expect(result.getData().buffer[0]).toBeCloseTo(0)
    })

    test('log2 - 2D array', () => {
      const arr = array([
        [1, 2],
        [4, 8],
      ])
      const result = log2(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3])
    })
  })

  describe('log1p', () => {
    test('log1p - small values (numerical stability)', () => {
      const arr = array([0, 0.0001, 0.001, 0.01], { dtype: 'float64' })
      const result = log1p(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      // log(1 + 0.0001) should be very close to 0.0001 for small values
      expect(data.buffer[1]).toBeCloseTo(0.00009999500033, 10)
      expect(data.buffer[2]).toBeCloseTo(0.0009995003331, 10)
      expect(data.buffer[3]).toBeCloseTo(0.00995033085, 10)
    })

    test('log1p - large values', () => {
      const arr = array([0, 1, 9, 99], { dtype: 'float64' })
      const result = log1p(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(Math.log(2))
      expect(data.buffer[2]).toBeCloseTo(Math.log(10))
      expect(data.buffer[3]).toBeCloseTo(Math.log(100))
    })

    test('log1p - negative values', () => {
      const arr = array([-0.5, -0.9], { dtype: 'float64' })
      const result = log1p(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(Math.log(0.5))
      expect(data.buffer[1]).toBeCloseTo(Math.log(0.1))
    })

    test('log1p - 2D array', () => {
      const arr = array(
        [
          [0, 1],
          [9, 99],
        ],
        { dtype: 'float64' }
      )
      const result = log1p(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(Math.log(2))
    })
  })

  describe('expm1', () => {
    test('expm1 - small values (numerical stability)', () => {
      const arr = array([0, 0.0001, 0.001, 0.01], { dtype: 'float64' })
      const result = expm1(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      // exp(0.0001) - 1 should be very close to 0.0001 for small values
      expect(data.buffer[1]).toBeCloseTo(0.00010000500016, 10)
      expect(data.buffer[2]).toBeCloseTo(0.0010005001667, 10)
      expect(data.buffer[3]).toBeCloseTo(0.01005016708, 10)
    })

    test('expm1 - large values', () => {
      const arr = array([0, 1, 2, 3], { dtype: 'float64' })
      const result = expm1(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(Math.E - 1)
      expect(data.buffer[2]).toBeCloseTo(Math.E ** 2 - 1)
      expect(data.buffer[3]).toBeCloseTo(Math.E ** 3 - 1)
    })

    test('expm1 - negative values', () => {
      const arr = array([-1, -2], { dtype: 'float64' })
      const result = expm1(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(Math.E ** -1 - 1)
      expect(data.buffer[1]).toBeCloseTo(Math.E ** -2 - 1)
    })

    test('expm1 - 2D array', () => {
      const arr = array(
        [
          [0, 1],
          [2, 3],
        ],
        { dtype: 'float64' }
      )
      const result = expm1(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(Math.E - 1)
    })
  })

  describe('Integration - numerical stability', () => {
    test('log1p vs log for small values', () => {
      const x = 1e-10
      const arr = array([x], { dtype: 'float64' })

      const log1pResult = log1p(arr).getData().buffer[0]
      const logResult = Math.log(1 + x)

      // log1p should be more accurate
      expect(log1pResult).toBeCloseTo(x, 10)
      // Regular log might lose precision
      expect(Math.abs(log1pResult - logResult)).toBeLessThan(1e-15)
    })

    test('expm1 vs exp for small values', () => {
      const x = 1e-10
      const arr = array([x], { dtype: 'float64' })

      const expm1Result = expm1(arr).getData().buffer[0]
      const expResult = Math.exp(x) - 1

      // expm1 should be more accurate
      expect(expm1Result).toBeCloseTo(x, 10)
      // Regular exp might lose precision
      expect(Math.abs(expm1Result - expResult)).toBeLessThan(1e-15)
    })

    test('exp2 and log2 are inverses', () => {
      const arr = array([1, 2, 3, 4])
      const exp2Result = exp2(arr)
      const log2Result = log2(exp2Result)
      const data = log2Result.getData()

      expect(data.buffer[0]).toBeCloseTo(1)
      expect(data.buffer[1]).toBeCloseTo(2)
      expect(data.buffer[2]).toBeCloseTo(3)
      expect(data.buffer[3]).toBeCloseTo(4)
    })

    test('log1p and expm1 are inverses', () => {
      const arr = array([0.1, 0.5, 1.0, 2.0], { dtype: 'float64' })
      const log1pResult = log1p(arr)
      const expm1Result = expm1(log1pResult)
      const data = expm1Result.getData()

      expect(data.buffer[0]).toBeCloseTo(0.1)
      expect(data.buffer[1]).toBeCloseTo(0.5)
      expect(data.buffer[2]).toBeCloseTo(1.0)
      expect(data.buffer[3]).toBeCloseTo(2.0)
    })
  })
})
