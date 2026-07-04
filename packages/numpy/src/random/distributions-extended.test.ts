import { describe, expect, test } from 'bun:test'
import { chisquare, lognormal, pareto, setSeed, triangular, weibull } from './index'

describe('Extended Random Distributions', () => {
  describe('chisquare', () => {
    test('chisquare - basic shape', () => {
      setSeed(42)
      const result = chisquare(3, 100)

      expect(result.shape).toEqual([100])
      expect(result.getData().dtype).toBe('float64')
    })

    test('chisquare - all positive values', () => {
      setSeed(42)
      const result = chisquare(5, 50)
      const data = result.getData().buffer

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBeGreaterThanOrEqual(0)
      }
    })

    test('chisquare - mean approximation', () => {
      setSeed(42)
      const df = 10
      const result = chisquare(df, 1000)
      const data = result.getData().buffer

      let sum = 0
      for (let i = 0; i < data.length; i++) {
        sum += data[i]
      }
      const mean = sum / data.length

      // Mean of chi-square(k) = k
      expect(mean).toBeGreaterThan(df * 0.8)
      expect(mean).toBeLessThan(df * 1.2)
    })

    test('chisquare - invalid df error', () => {
      expect(() => chisquare(0, 10)).toThrow('positive')
      expect(() => chisquare(-1, 10)).toThrow('positive')
    })

    test('chisquare - 2D shape', () => {
      setSeed(42)
      const result = chisquare(3, [5, 10])

      expect(result.shape).toEqual([5, 10])
      expect(result.size).toBe(50)
    })
  })

  describe('lognormal', () => {
    test('lognormal - basic shape', () => {
      setSeed(42)
      const result = lognormal(0, 1, 100)

      expect(result.shape).toEqual([100])
      expect(result.getData().dtype).toBe('float64')
    })

    test('lognormal - all positive values', () => {
      setSeed(42)
      const result = lognormal(0, 1, 50)
      const data = result.getData().buffer

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBeGreaterThan(0)
      }
    })

    test('lognormal - mean=0 sigma=1', () => {
      setSeed(42)
      const result = lognormal(0, 1, 1000)
      const data = result.getData().buffer

      // For lognormal(0, 1), median ≈ 1
      const sorted = Array.from(data).sort((a, b) => a - b)
      const median = sorted[500]

      expect(median).toBeGreaterThan(0.8)
      expect(median).toBeLessThan(1.5)
    })

    test('lognormal - invalid sigma error', () => {
      expect(() => lognormal(0, 0, 10)).toThrow('positive')
      expect(() => lognormal(0, -1, 10)).toThrow('positive')
    })

    test('lognormal - 2D shape', () => {
      setSeed(42)
      const result = lognormal(0, 1, [3, 4])

      expect(result.shape).toEqual([3, 4])
      expect(result.size).toBe(12)
    })
  })

  describe('triangular', () => {
    test('triangular - basic shape', () => {
      setSeed(42)
      const result = triangular(0, 0.5, 1, 100)

      expect(result.shape).toEqual([100])
      expect(result.getData().dtype).toBe('float64')
    })

    test('triangular - values in range', () => {
      setSeed(42)
      const left = 10
      const mode = 15
      const right = 20
      const result = triangular(left, mode, right, 100)
      const data = result.getData().buffer

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBeGreaterThanOrEqual(left)
        expect(data[i]).toBeLessThanOrEqual(right)
      }
    })

    test('triangular - mode approximation', () => {
      setSeed(42)
      const left = 0
      const mode = 0.3
      const right = 1
      const result = triangular(left, mode, right, 1000)
      const data = result.getData().buffer

      let sum = 0
      for (let i = 0; i < data.length; i++) {
        sum += data[i]
      }
      const mean = sum / data.length

      // Mean of triangular = (left + mode + right) / 3
      const expectedMean = (left + mode + right) / 3
      expect(mean).toBeGreaterThan(expectedMean * 0.9)
      expect(mean).toBeLessThan(expectedMean * 1.1)
    })

    test('triangular - invalid range error', () => {
      expect(() => triangular(1, 0, 2, 10)).toThrow('left <= mode <= right')
      expect(() => triangular(0, 2, 1, 10)).toThrow('left <= mode <= right')
    })

    test('triangular - 2D shape', () => {
      setSeed(42)
      const result = triangular(0, 0.5, 1, [4, 5])

      expect(result.shape).toEqual([4, 5])
      expect(result.size).toBe(20)
    })
  })

  describe('weibull', () => {
    test('weibull - basic shape', () => {
      setSeed(42)
      const result = weibull(1.5, 1, 100)

      expect(result.shape).toEqual([100])
      expect(result.getData().dtype).toBe('float64')
    })

    test('weibull - all positive values', () => {
      setSeed(42)
      const result = weibull(2, 1, 50)
      const data = result.getData().buffer

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBeGreaterThanOrEqual(0)
      }
    })

    test('weibull - k=1 is exponential', () => {
      setSeed(42)
      const lambda = 2
      const result = weibull(1, lambda, 1000)
      const data = result.getData().buffer

      // For Weibull(k=1, λ), mean = λ
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        sum += data[i]
      }
      const mean = sum / data.length

      expect(mean).toBeGreaterThan(lambda * 0.8)
      expect(mean).toBeLessThan(lambda * 1.2)
    })

    test('weibull - invalid parameters error', () => {
      expect(() => weibull(0, 1, 10)).toThrow('positive')
      expect(() => weibull(1, 0, 10)).toThrow('positive')
      expect(() => weibull(-1, 1, 10)).toThrow('positive')
    })

    test('weibull - 2D shape', () => {
      setSeed(42)
      const result = weibull(1.5, 1, [2, 3])

      expect(result.shape).toEqual([2, 3])
      expect(result.size).toBe(6)
    })
  })

  describe('pareto', () => {
    test('pareto - basic shape', () => {
      setSeed(42)
      const result = pareto(2, 100)

      expect(result.shape).toEqual([100])
      expect(result.getData().dtype).toBe('float64')
    })

    test('pareto - all >= 1', () => {
      setSeed(42)
      const result = pareto(3, 50)
      const data = result.getData().buffer

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBeGreaterThanOrEqual(1)
      }
    })

    test('pareto - mean approximation for a>1', () => {
      setSeed(42)
      const a = 3
      const result = pareto(a, 1000)
      const data = result.getData().buffer

      let sum = 0
      for (let i = 0; i < data.length; i++) {
        sum += data[i]
      }
      const mean = sum / data.length

      // Mean of Pareto(a) = a/(a-1) for a > 1
      const expectedMean = a / (a - 1)
      expect(mean).toBeGreaterThan(expectedMean * 0.8)
      expect(mean).toBeLessThan(expectedMean * 1.2)
    })

    test('pareto - invalid parameter error', () => {
      expect(() => pareto(0, 10)).toThrow('positive')
      expect(() => pareto(-1, 10)).toThrow('positive')
    })

    test('pareto - 2D shape', () => {
      setSeed(42)
      const result = pareto(2, [3, 3])

      expect(result.shape).toEqual([3, 3])
      expect(result.size).toBe(9)
    })
  })

  describe('Integration - Distribution Combinations', () => {
    test('chi-square vs normal squared', () => {
      setSeed(42)
      const chi1 = chisquare(1, 100)
      const chiData = chi1.getData().buffer

      // Chi-square(1) should have similar distribution to Z²
      // Check that values are reasonable
      for (let i = 0; i < chiData.length; i++) {
        expect(chiData[i]).toBeGreaterThanOrEqual(0)
        expect(chiData[i]).toBeLessThan(50) // Very rare to exceed this
      }
    })

    test('lognormal vs weibull power law behavior', () => {
      setSeed(42)
      const ln = lognormal(0, 1, 100)
      const wb = weibull(1.5, 1, 100)

      // Both should be positive and right-skewed
      const lnData = ln.getData().buffer
      const wbData = wb.getData().buffer

      for (let i = 0; i < 100; i++) {
        expect(lnData[i]).toBeGreaterThan(0)
        expect(wbData[i]).toBeGreaterThan(0)
      }
    })
  })
})
