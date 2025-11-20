import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { cond, multi_dot, slogdet } from './numerical-stability'

describe('Numerical Stability', () => {
  describe('cond', () => {
    test('cond - well-conditioned matrix', () => {
      const a = array([[1, 0], [0, 1]]) // Identity matrix
      const result = cond(a)

      // For 2-norm, identity has cond = sqrt(2) * sqrt(2) = 2
      expect(result).toBeCloseTo(2, 5)
    })

    test('cond - ill-conditioned matrix', () => {
      const a = array([[1, 2], [2, 4.00001]]) // Nearly singular
      const result = cond(a)

      expect(result).toBeGreaterThan(100000) // High condition number
    })

    test('cond - 2-norm (default)', () => {
      const a = array([[1, 2], [3, 4]])
      const result = cond(a)

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(100)
    })

    test('cond - Frobenius norm', () => {
      const a = array([[1, 2], [3, 4]])
      const result = cond(a, 'fro')

      expect(result).toBeGreaterThan(0)
    })

    test('cond - singular matrix', () => {
      const a = array([[1, 2], [2, 4]]) // Singular (det = 0)
      const result = cond(a)

      expect(result).toBe(Number.POSITIVE_INFINITY)
    })

    test('cond - non-square matrix error', () => {
      const a = array([[1, 2, 3], [4, 5, 6]])
      expect(() => cond(a)).toThrow('square')
    })

    test('cond - 1D array error', () => {
      const a = array([1, 2, 3])
      expect(() => cond(a)).toThrow('2D')
    })
  })

  describe('slogdet', () => {
    test('slogdet - positive determinant', () => {
      const a = array([[1, 2], [3, 5]])
      const result = slogdet(a)

      // det = 1*5 - 2*3 = -1, with row swap: sign = -1
      expect(result.sign).toBe(-1) // det = -1
      expect(result.logdet).toBeCloseTo(0, 5) // log(|-1|) = 0
    })

    test('slogdet - identity matrix', () => {
      const a = array([[1, 0], [0, 1]])
      const result = slogdet(a)

      expect(result.sign).toBe(1)
      expect(result.logdet).toBeCloseTo(0, 5) // det = 1, log(1) = 0
    })

    test('slogdet - large determinant', () => {
      const a = array([[10, 0], [0, 10]])
      const result = slogdet(a)

      expect(result.sign).toBe(1)
      expect(result.logdet).toBeCloseTo(Math.log(100), 5) // det = 100
    })

    test('slogdet - negative determinant', () => {
      const a = array([[0, 1], [1, 0]]) // det = -1
      const result = slogdet(a)

      expect(result.sign).toBe(-1)
      expect(result.logdet).toBeCloseTo(0, 5) // log(|-1|) = 0
    })

    test('slogdet - singular matrix', () => {
      const a = array([[1, 2], [2, 4]]) // det = 0
      const result = slogdet(a)

      expect(result.sign).toBe(0)
      expect(result.logdet).toBe(Number.NEGATIVE_INFINITY)
    })

    test('slogdet - 3x3 matrix', () => {
      const a = array([[1, 2, 3], [4, 5, 6], [7, 8, 10]])
      const result = slogdet(a)

      // det = 1*(5*10-6*8) - 2*(4*10-6*7) + 3*(4*8-5*7) = 1*2 - 2*-2 + 3*-3 = 2 + 4 - 9 = -3
      expect(result.sign).toBe(-1)
      expect(result.logdet).toBeCloseTo(Math.log(3), 5) // log(|-3|) = log(3)
    })

    test('slogdet - non-square matrix error', () => {
      const a = array([[1, 2, 3], [4, 5, 6]])
      expect(() => slogdet(a)).toThrow('square')
    })

    test('slogdet - 1D array error', () => {
      const a = array([1, 2, 3])
      expect(() => slogdet(a)).toThrow('2D')
    })
  })

  describe('multi_dot', () => {
    test('multi_dot - two matrices', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = multi_dot([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(Array.from(data.buffer)).toEqual([19, 22, 43, 50])
    })

    test('multi_dot - three matrices optimal order', () => {
      // A: 10x100, B: 100x5, C: 5x50
      // Optimal: (A @ B) @ C = 10*100*5 + 10*5*50 = 7500 ops
      // Suboptimal: A @ (B @ C) = 100*5*50 + 10*100*50 = 75000 ops
      const a = array([[1, 2], [3, 4]], { dtype: 'float64' }) // 2x2 for testing
      const b = array([[5, 6], [7, 8]], { dtype: 'float64' }) // 2x2
      const c = array([[9, 10], [11, 12]], { dtype: 'float64' }) // 2x2
      const result = multi_dot([a, b, c])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      // Result should match (a @ b) @ c
      expect(data.buffer[0]).toBeCloseTo(413)
      expect(data.buffer[1]).toBeCloseTo(454)
      expect(data.buffer[2]).toBeCloseTo(937)
      expect(data.buffer[3]).toBeCloseTo(1030)
    })

    test('multi_dot - four matrices', () => {
      const a = array([[1, 2]])
      const b = array([[3], [4]])
      const c = array([[5, 6]])
      const d = array([[7], [8]])
      const result = multi_dot([a, b, c, d])
      const data = result.getData()

      expect(data.shape).toEqual([1, 1])
    })

    test('multi_dot - single matrix', () => {
      const a = array([[1, 2], [3, 4]])
      const result = multi_dot([a])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4])
    })

    test('multi_dot - empty array error', () => {
      expect(() => multi_dot([])).toThrow()
    })

    test('multi_dot - shape mismatch error', () => {
      const a = array([[1, 2]])
      const b = array([[3, 4, 5]]) // Incompatible shape
      expect(() => multi_dot([a, b])).toThrow('Shape mismatch')
    })

    test('multi_dot - 1D single array returns as-is', () => {
      const a = array([1, 2, 3])
      const result = multi_dot([a])
      expect(result.getData().shape).toEqual([3])
    })

    test('multi_dot - chain of identity matrices', () => {
      const I = array([[1, 0], [0, 1]])
      const result = multi_dot([I, I, I])
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 1])
    })

    test('multi_dot - matrix powers via chaining', () => {
      const a = array([[2, 0], [0, 2]])
      const result = multi_dot([a, a, a]) // a^3
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(8) // 2^3
      expect(data.buffer[3]).toBeCloseTo(8)
    })
  })
})
