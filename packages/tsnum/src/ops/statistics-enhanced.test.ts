import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { average, nanpercentile, nanquantile, ptp } from './statistics'

describe('Enhanced Statistics Functions', () => {
  describe('average', () => {
    test('average - unweighted', () => {
      const arr = array([1, 2, 3, 4])
      const result = average(arr)

      expect(result).toBeCloseTo(2.5)
    })

    test('average - uniform weights', () => {
      const arr = array([1, 2, 3, 4])
      const weights = array([1, 1, 1, 1])
      const result = average(arr, weights)

      expect(result).toBeCloseTo(2.5)
    })

    test('average - weighted', () => {
      const arr = array([1, 2, 3, 4])
      const weights = array([1, 2, 3, 4])
      const result = average(arr, weights)

      // (1*1 + 2*2 + 3*3 + 4*4) / (1+2+3+4) = 30 / 10 = 3.0
      expect(result).toBeCloseTo(3.0)
    })

    test('average - weights favor first element', () => {
      const arr = array([1, 2, 3, 4])
      const weights = array([10, 1, 1, 1])
      const result = average(arr, weights)

      // (1*10 + 2*1 + 3*1 + 4*1) / (10+1+1+1) = 19 / 13 ≈ 1.46
      expect(result).toBeCloseTo(1.46, 2)
    })

    test('average - zero weights error', () => {
      const arr = array([1, 2, 3])
      const weights = array([0, 0, 0])

      expect(() => average(arr, weights)).toThrow('sum of weights is zero')
    })

    test('average - mismatched shape error', () => {
      const arr = array([1, 2, 3])
      const weights = array([1, 2])

      expect(() => average(arr, weights)).toThrow('same size')
    })

    test('average - 2D array', () => {
      const arr = array([
        [1, 2],
        [3, 4],
      ])
      const result = average(arr)

      expect(result).toBeCloseTo(2.5)
    })
  })

  describe('ptp', () => {
    test('ptp - basic range', () => {
      const arr = array([1, 2, 3, 4, 5])
      const result = ptp(arr)

      expect(result).toBe(4) // 5 - 1
    })

    test('ptp - negative values', () => {
      const arr = array([-5, -2, 0, 3, 7])
      const result = ptp(arr)

      expect(result).toBe(12) // 7 - (-5)
    })

    test('ptp - all same values', () => {
      const arr = array([5, 5, 5, 5])
      const result = ptp(arr)

      expect(result).toBe(0)
    })

    test('ptp - single element', () => {
      const arr = array([42])
      const result = ptp(arr)

      expect(result).toBe(0)
    })

    test('ptp - empty array', () => {
      const arr = array([])
      const result = ptp(arr)

      expect(result).toBe(0)
    })

    test('ptp - 2D array', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
      ])
      const result = ptp(arr)

      expect(result).toBe(5) // 6 - 1 (flattened)
    })

    test('ptp - fractional values', () => {
      const arr = array([1.5, 2.7, 0.3, 4.2], { dtype: 'float64' })
      const result = ptp(arr)

      expect(result).toBeCloseTo(3.9, 5) // 4.2 - 0.3
    })
  })

  describe('nanpercentile', () => {
    test('nanpercentile - basic (50th)', () => {
      const arr = array([1, 2, Number.NaN, 3, 4], { dtype: 'float64' })
      const result = nanpercentile(arr, 50)

      expect(result).toBeCloseTo(2.5) // Median of [1, 2, 3, 4]
    })

    test('nanpercentile - 0th percentile', () => {
      const arr = array([1, 2, Number.NaN, 3, 4], { dtype: 'float64' })
      const result = nanpercentile(arr, 0)

      expect(result).toBeCloseTo(1)
    })

    test('nanpercentile - 100th percentile', () => {
      const arr = array([1, 2, Number.NaN, 3, 4], { dtype: 'float64' })
      const result = nanpercentile(arr, 100)

      expect(result).toBeCloseTo(4)
    })

    test('nanpercentile - 25th percentile', () => {
      const arr = array([1, Number.NaN, 2, 3, 4], { dtype: 'float64' })
      const result = nanpercentile(arr, 25)

      expect(result).toBeCloseTo(1.75) // 25% of [1, 2, 3, 4]
    })

    test('nanpercentile - 75th percentile', () => {
      const arr = array([1, Number.NaN, 2, 3, 4], { dtype: 'float64' })
      const result = nanpercentile(arr, 75)

      expect(result).toBeCloseTo(3.25) // 75% of [1, 2, 3, 4]
    })

    test('nanpercentile - all NaN', () => {
      const arr = array([Number.NaN, Number.NaN, Number.NaN], { dtype: 'float64' })
      const result = nanpercentile(arr, 50)

      expect(Number.isNaN(result)).toBe(true)
    })

    test('nanpercentile - no NaN', () => {
      const arr = array([1, 2, 3, 4, 5])
      const result = nanpercentile(arr, 50)

      expect(result).toBeCloseTo(3)
    })

    test('nanpercentile - single non-NaN', () => {
      const arr = array([Number.NaN, 42, Number.NaN], { dtype: 'float64' })
      const result = nanpercentile(arr, 50)

      expect(result).toBe(42)
    })

    test('nanpercentile - invalid percentile error', () => {
      const arr = array([1, 2, 3])
      expect(() => nanpercentile(arr, -1)).toThrow('0 and 100')
      expect(() => nanpercentile(arr, 101)).toThrow('0 and 100')
    })
  })

  describe('nanquantile', () => {
    test('nanquantile - basic (0.5)', () => {
      const arr = array([1, 2, Number.NaN, 3, 4], { dtype: 'float64' })
      const result = nanquantile(arr, 0.5)

      expect(result).toBeCloseTo(2.5)
    })

    test('nanquantile - 0.0 quantile', () => {
      const arr = array([1, Number.NaN, 2, 3], { dtype: 'float64' })
      const result = nanquantile(arr, 0.0)

      expect(result).toBeCloseTo(1)
    })

    test('nanquantile - 1.0 quantile', () => {
      const arr = array([1, Number.NaN, 2, 3], { dtype: 'float64' })
      const result = nanquantile(arr, 1.0)

      expect(result).toBeCloseTo(3)
    })

    test('nanquantile - 0.25 quantile', () => {
      const arr = array([1, Number.NaN, 2, 3, 4], { dtype: 'float64' })
      const result = nanquantile(arr, 0.25)

      expect(result).toBeCloseTo(1.75)
    })

    test('nanquantile - 0.75 quantile', () => {
      const arr = array([1, Number.NaN, 2, 3, 4], { dtype: 'float64' })
      const result = nanquantile(arr, 0.75)

      expect(result).toBeCloseTo(3.25)
    })

    test('nanquantile - all NaN', () => {
      const arr = array([Number.NaN, Number.NaN], { dtype: 'float64' })
      const result = nanquantile(arr, 0.5)

      expect(Number.isNaN(result)).toBe(true)
    })

    test('nanquantile - invalid quantile error', () => {
      const arr = array([1, 2, 3])
      expect(() => nanquantile(arr, -0.1)).toThrow('0 and 1')
      expect(() => nanquantile(arr, 1.1)).toThrow('0 and 1')
    })
  })

  describe('Integration', () => {
    test('average with ptp for range analysis', () => {
      const data = array([10, 20, 30, 40, 50])

      const avg = average(data)
      const range = ptp(data)

      expect(avg).toBeCloseTo(30)
      expect(range).toBe(40) // 50 - 10
    })

    test('nanpercentile vs nanquantile equivalence', () => {
      const data = array([1, 2, Number.NaN, 3, 4, 5], { dtype: 'float64' })

      const p50 = nanpercentile(data, 50)
      const q50 = nanquantile(data, 0.5)

      expect(p50).toBeCloseTo(q50)
    })

    test('weighted average for risk analysis', () => {
      // Portfolio: returns [0.05, 0.10, 0.15]
      // Weights: allocations [0.2, 0.5, 0.3]
      const returns = array([0.05, 0.10, 0.15], { dtype: 'float64' })
      const allocations = array([0.2, 0.5, 0.3], { dtype: 'float64' })

      const expectedReturn = average(returns, allocations)

      // Expected: 0.05*0.2 + 0.10*0.5 + 0.15*0.3 = 0.01 + 0.05 + 0.045 = 0.105
      expect(expectedReturn).toBeCloseTo(0.105)
    })
  })
})
