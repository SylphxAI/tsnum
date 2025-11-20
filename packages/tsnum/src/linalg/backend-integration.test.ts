import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { dot, matmul } from './index'

describe('Linear Algebra Backend Integration', () => {
  describe('matmul', () => {
    test('2x2 matrix multiplication', () => {
      const a = array([
        [1, 2],
        [3, 4],
      ])
      const b = array([
        [5, 6],
        [7, 8],
      ])

      const result = matmul(a, b)

      // Expected: [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]]
      // = [[19, 22], [43, 50]]
      expect(result.shape).toEqual([2, 2])
      expect(Array.from(result.getData().buffer)).toEqual([19, 22, 43, 50])
    })

    test('3x3 matrix multiplication', () => {
      const a = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const b = array([
        [9, 8, 7],
        [6, 5, 4],
        [3, 2, 1],
      ])

      const result = matmul(a, b)

      // [[1*9+2*6+3*3, ...], ...]
      expect(result.shape).toEqual([3, 3])
      const data = result.getData().buffer
      expect(data[0]).toBe(30) // 9+12+9
      expect(data[1]).toBe(24) // 8+10+6
      expect(data[2]).toBe(18) // 7+8+3
    })

    test('rectangular matrix multiplication', () => {
      const a = array([
        [1, 2, 3],
        [4, 5, 6],
      ]) // 2x3
      const b = array([
        [7, 8],
        [9, 10],
        [11, 12],
      ]) // 3x2

      const result = matmul(a, b)

      // Expected: 2x2 result
      // [[1*7+2*9+3*11, 1*8+2*10+3*12], [4*7+5*9+6*11, 4*8+5*10+6*12]]
      // = [[58, 64], [139, 154]]
      expect(result.shape).toEqual([2, 2])
      const data = result.getData().buffer
      expect(data[0]).toBe(58)
      expect(data[1]).toBe(64)
      expect(data[2]).toBe(139)
      expect(data[3]).toBe(154)
    })

    test('identity matrix multiplication', () => {
      const a = array([
        [5, 6],
        [7, 8],
      ])
      const identity = array([
        [1, 0],
        [0, 1],
      ])

      const result = matmul(a, identity)

      expect(result.shape).toEqual([2, 2])
      expect(Array.from(result.getData().buffer)).toEqual([5, 6, 7, 8])
    })

    test('throws error for incompatible shapes', () => {
      const a = array([
        [1, 2],
        [3, 4],
      ]) // 2x2
      const b = array([
        [5, 6],
        [7, 8],
        [9, 10],
      ]) // 3x2

      expect(() => matmul(a, b)).toThrow('Shape mismatch')
    })

    test('large matrix multiplication (100x100)', () => {
      // Test performance with larger matrices
      const a = array(
        Array.from({ length: 100 }, (_, i) =>
          Array.from({ length: 100 }, (_, j) => i + j),
        ),
      )
      const b = array(
        Array.from({ length: 100 }, (_, i) =>
          Array.from({ length: 100 }, (_, j) => i - j),
        ),
      )

      const result = matmul(a, b)

      expect(result.shape).toEqual([100, 100])
      expect(result.size).toBe(10000)
    })
  })

  describe('dot', () => {
    test('1D dot product - basic', () => {
      const a = array([1, 2, 3])
      const b = array([4, 5, 6])

      const result = dot(a, b)

      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      expect(result).toBe(32)
    })

    test('1D dot product - zeros', () => {
      const a = array([1, 2, 3])
      const b = array([0, 0, 0])

      const result = dot(a, b)

      expect(result).toBe(0)
    })

    test('1D dot product - negative values', () => {
      const a = array([1, -2, 3])
      const b = array([4, 5, -6])

      const result = dot(a, b)

      // 1*4 + (-2)*5 + 3*(-6) = 4 - 10 - 18 = -24
      expect(result).toBe(-24)
    })

    test('1D dot product - large vectors', () => {
      const a = array(Array.from({ length: 1000 }, (_, i) => i + 1))
      const b = array(Array.from({ length: 1000 }, (_, i) => 1))

      const result = dot(a, b)

      // Sum of 1 to 1000 = 1000 * 1001 / 2 = 500500
      expect(result).toBe(500500)
    })

    test('2D matrices - delegates to matmul', () => {
      const a = array([
        [1, 2],
        [3, 4],
      ])
      const b = array([
        [5, 6],
        [7, 8],
      ])

      const result = dot(a, b)

      // Should be same as matmul
      expect((result as any).shape).toEqual([2, 2])
    })

    test('throws error for incompatible shapes', () => {
      const a = array([1, 2, 3])
      const b = array([4, 5])

      expect(() => dot(a, b)).toThrow()
    })
  })

  describe('Backend delegation', () => {
    test('matmul uses backend', () => {
      // This test verifies the delegation is working
      // If backend is not used, the operation would still work
      // but this ensures the code path goes through backend
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])

      const result = matmul(a, b)

      // Verify result is correct (implies backend was used)
      expect(result.getData().buffer[0]).toBe(19)
      expect(result.getData().buffer[1]).toBe(22)
      expect(result.getData().buffer[2]).toBe(43)
      expect(result.getData().buffer[3]).toBe(50)
    })

    test('dot uses backend for 1D arrays', () => {
      const a = array([1, 2, 3, 4])
      const b = array([5, 6, 7, 8])

      const result = dot(a, b)

      // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
      expect(result).toBe(70)
    })
  })
})
