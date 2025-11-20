import { describe, expect, test } from 'bun:test'
import { array } from './creation'
import { vander } from './creation-vander'

describe('Vandermonde Matrix', () => {
  describe('vander', () => {
    test('vander - basic usage (decreasing)', () => {
      const x = array([1, 2, 3, 4])
      const result = vander(x, 3)
      const data = result.getData()

      expect(data.shape).toEqual([4, 3])
      // Row 0: [1^2, 1^1, 1^0] = [1, 1, 1]
      // Row 1: [2^2, 2^1, 2^0] = [4, 2, 1]
      // Row 2: [3^2, 3^1, 3^0] = [9, 3, 1]
      // Row 3: [4^2, 4^1, 4^0] = [16, 4, 1]
      expect(Array.from(data.buffer)).toEqual([1, 1, 1, 4, 2, 1, 9, 3, 1, 16, 4, 1])
    })

    test('vander - square matrix (default N)', () => {
      const x = array([1, 2, 3])
      const result = vander(x)
      const data = result.getData()

      expect(data.shape).toEqual([3, 3])
      // [[1^2, 1^1, 1^0],
      //  [2^2, 2^1, 2^0],
      //  [3^2, 3^1, 3^0]]
      expect(Array.from(data.buffer)).toEqual([1, 1, 1, 4, 2, 1, 9, 3, 1])
    })

    test('vander - increasing powers', () => {
      const x = array([1, 2, 3])
      const result = vander(x, undefined, true)
      const data = result.getData()

      expect(data.shape).toEqual([3, 3])
      // [[1^0, 1^1, 1^2],
      //  [2^0, 2^1, 2^2],
      //  [3^0, 3^1, 3^2]]
      expect(Array.from(data.buffer)).toEqual([1, 1, 1, 1, 2, 4, 1, 3, 9])
    })

    test('vander - N > len(x)', () => {
      const x = array([1, 2])
      const result = vander(x, 4)
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      // Row 0: [1^3, 1^2, 1^1, 1^0] = [1, 1, 1, 1]
      // Row 1: [2^3, 2^2, 2^1, 2^0] = [8, 4, 2, 1]
      expect(Array.from(data.buffer)).toEqual([1, 1, 1, 1, 8, 4, 2, 1])
    })

    test('vander - N < len(x)', () => {
      const x = array([1, 2, 3, 4])
      const result = vander(x, 2)
      const data = result.getData()

      expect(data.shape).toEqual([4, 2])
      // Only 2 columns: [x^1, x^0]
      expect(Array.from(data.buffer)).toEqual([1, 1, 2, 1, 3, 1, 4, 1])
    })

    test('vander - N=1', () => {
      const x = array([1, 2, 3])
      const result = vander(x, 1)
      const data = result.getData()

      expect(data.shape).toEqual([3, 1])
      // Only [x^0] = [1, 1, 1]
      expect(Array.from(data.buffer)).toEqual([1, 1, 1])
    })

    test('vander - single element', () => {
      const x = array([5])
      const result = vander(x, 3)
      const data = result.getData()

      expect(data.shape).toEqual([1, 3])
      expect(Array.from(data.buffer)).toEqual([25, 5, 1])
    })

    test('vander - zeros', () => {
      const x = array([0, 0, 0])
      const result = vander(x, 3)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1])
    })

    test('vander - negative values', () => {
      const x = array([-1, -2])
      const result = vander(x, 3)
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      // Row 0: [(-1)^2, (-1)^1, (-1)^0] = [1, -1, 1]
      // Row 1: [(-2)^2, (-2)^1, (-2)^0] = [4, -2, 1]
      expect(Array.from(data.buffer)).toEqual([1, -1, 1, 4, -2, 1])
    })

    test('vander - fractional values', () => {
      const x = array([0.5, 2], { dtype: 'float64' })
      const result = vander(x, 3)
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      // Row 0: [0.5^2, 0.5^1, 0.5^0] = [0.25, 0.5, 1]
      // Row 1: [2^2, 2^1, 2^0] = [4, 2, 1]
      expect(data.buffer[0]).toBeCloseTo(0.25)
      expect(data.buffer[1]).toBeCloseTo(0.5)
      expect(data.buffer[2]).toBeCloseTo(1)
      expect(data.buffer[3]).toBeCloseTo(4)
      expect(data.buffer[4]).toBeCloseTo(2)
      expect(data.buffer[5]).toBeCloseTo(1)
    })

    test('vander - 2D input error', () => {
      const x = array([[1, 2], [3, 4]])
      expect(() => vander(x)).toThrow('1-D')
    })

    test('vander - negative N error', () => {
      const x = array([1, 2, 3])
      expect(() => vander(x, -1)).toThrow('non-negative')
    })
  })

  describe('Integration - polynomial fitting', () => {
    test('vander for polynomial fitting', () => {
      // Use Vandermonde matrix for polynomial fitting
      // Fit y = 2x^2 + 3x + 1 through points at x = [0, 1, 2]
      const x = array([0, 1, 2])
      const V = vander(x, 3) // 3x3 Vandermonde matrix
      const data = V.getData()

      // Verify Vandermonde structure
      expect(data.shape).toEqual([3, 3])

      // V = [[0, 0, 1],
      //      [1, 1, 1],
      //      [4, 2, 1]]
      expect(Array.from(data.buffer)).toEqual([0, 0, 1, 1, 1, 1, 4, 2, 1])
    })

    test('vander increasing for alternate convention', () => {
      const x = array([0, 1, 2])
      const V = vander(x, 3, true)
      const data = V.getData()

      // V = [[1, 0, 0],
      //      [1, 1, 1],
      //      [1, 2, 4]]
      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 1, 1, 1, 1, 2, 4])
    })
  })
})
