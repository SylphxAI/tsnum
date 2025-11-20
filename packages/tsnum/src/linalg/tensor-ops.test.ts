import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { kron, tensordot, vdot } from './index'

describe('Tensor Operations', () => {
  describe('vdot', () => {
    test('vdot - 1D vectors', () => {
      const a = array([1, 2, 3])
      const b = array([4, 5, 6])
      const result = vdot(a, b)

      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      expect(result).toBe(32)
    })

    test('vdot - 2D arrays (flattened)', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = vdot(a, b)

      // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
      expect(result).toBe(70)
    })

    test('vdot - single element', () => {
      const a = array([5])
      const b = array([7])
      const result = vdot(a, b)

      expect(result).toBe(35)
    })

    test('vdot - zeros', () => {
      const a = array([0, 0, 0])
      const b = array([1, 2, 3])
      const result = vdot(a, b)

      expect(result).toBe(0)
    })

    test('vdot - negative values', () => {
      const a = array([1, -2, 3])
      const b = array([-4, 5, -6])
      const result = vdot(a, b)

      // 1*(-4) + (-2)*5 + 3*(-6) = -4 - 10 - 18 = -32
      expect(result).toBe(-32)
    })

    test('vdot - size mismatch error', () => {
      const a = array([1, 2, 3])
      const b = array([1, 2])

      expect(() => vdot(a, b)).toThrow('same total size')
    })

    test('vdot - complex arrays (real part)', () => {
      const a = array([[1, 2], [3, 4]]) // Treated as 2 complex numbers: 1+2i, 3+4i
      const b = array([[5, 6], [7, 8]]) // 5+6i, 7+8i
      const result = vdot(a, b)

      // conj(1+2i)*(5+6i) + conj(3+4i)*(7+8i)
      // = (1-2i)(5+6i) + (3-4i)(7+8i)
      // = (5+6i-10i-12i²) + (21+24i-28i-32i²)
      // = (5+6i-10i+12) + (21+24i-28i+32)
      // = (17-4i) + (53-4i) = 70-8i
      // Real part: 70
      expect(result).toBe(70)
    })
  })

  describe('kron', () => {
    test('kron - basic 2x2 matrices', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[0, 5], [6, 7]])
      const result = kron(a, b)
      const data = result.getData()

      expect(data.shape).toEqual([4, 4])

      // Expected:
      // [[1*B, 2*B],
      //  [3*B, 4*B]]
      //
      // = [[0, 5, 0, 10],
      //    [6, 7, 12, 14],
      //    [0, 15, 0, 20],
      //    [18, 21, 24, 28]]

      expect(Array.from(data.buffer)).toEqual([
        0, 5, 0, 10,
        6, 7, 12, 14,
        0, 15, 0, 20,
        18, 21, 24, 28
      ])
    })

    test('kron - identity matrices', () => {
      const I = array([[1, 0], [0, 1]])
      const result = kron(I, I)
      const data = result.getData()

      expect(data.shape).toEqual([4, 4])
      expect(Array.from(data.buffer)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    })

    test('kron - scalar multiplication', () => {
      const a = array([[2, 0], [0, 2]])
      const b = array([[1, 1], [1, 1]])
      const result = kron(a, b)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([
        2, 2, 0, 0,
        2, 2, 0, 0,
        0, 0, 2, 2,
        0, 0, 2, 2
      ])
    })

    test('kron - rectangular matrices', () => {
      const a = array([[1, 2]])
      const b = array([[3], [4]])
      const result = kron(a, b)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      // [[1*3, 2*3],
      //  [1*4, 2*4]]
      expect(Array.from(data.buffer)).toEqual([3, 6, 4, 8])
    })

    test('kron - non-square matrices', () => {
      const a = array([[1, 2, 3]])
      const b = array([[4], [5]])
      const result = kron(a, b)
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      expect(Array.from(data.buffer)).toEqual([4, 8, 12, 5, 10, 15])
    })

    test('kron - 1D array error', () => {
      const a = array([1, 2])
      const b = array([3, 4])

      expect(() => kron(a, b)).toThrow('2D')
    })
  })

  describe('tensordot', () => {
    test('tensordot - axes=1 (matrix multiplication)', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = tensordot(a, b, 1)
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      // [[1*5+2*7, 1*6+2*8],
      //  [3*5+4*7, 3*6+4*8]]
      // = [[19, 22], [43, 50]]
      expect(Array.from(data.buffer)).toEqual([19, 22, 43, 50])
    })

    test('tensordot - axes=[[1],[0]] (matrix multiplication)', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = tensordot(a, b, [[1], [0]])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      expect(Array.from(data.buffer)).toEqual([19, 22, 43, 50])
    })

    test('tensordot - axes=[[0],[0]] (sum over rows)', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = tensordot(a, b, [[0], [0]])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2])
      // Sum over axis 0:
      // [[1*5+3*7, 1*6+3*8],
      //  [2*5+4*7, 2*6+4*8]]
      // = [[26, 30], [38, 44]]
      expect(Array.from(data.buffer)).toEqual([26, 30, 38, 44])
    })

    test('tensordot - vectors (inner product)', () => {
      const a = array([[1], [2]])
      const b = array([[3], [4]])
      const result = tensordot(a, b, [[0], [0]])
      const data = result.getData()

      expect(data.shape).toEqual([1, 1])
      // 1*3 + 2*4 = 11
      expect(data.buffer[0]).toBe(11)
    })

    test('tensordot - axes mismatch error', () => {
      const a = array([[1, 2, 3], [4, 5, 6]])
      const b = array([[7, 8], [9, 10]])

      expect(() => tensordot(a, b, 1)).toThrow('shape mismatch')
    })

    test('tensordot - invalid axes error', () => {
      const a = array([[1, 2]])
      const b = array([[3, 4]])

      expect(() => tensordot(a, b, [[5], [0]])).toThrow('out of bounds')
    })

    test('tensordot - axes array length mismatch error', () => {
      const a = array([[1, 2]])
      const b = array([[3, 4]])

      expect(() => tensordot(a, b, [[0, 1], [0]])).toThrow('same length')
    })
  })

  describe('Integration - tensor operations', () => {
    test('kron for quantum computing (tensor product of states)', () => {
      // |0⟩ ⊗ |1⟩ in quantum computing
      const ket0 = array([[1], [0]])
      const ket1 = array([[0], [1]])
      const result = kron(ket0, ket1)
      const data = result.getData()

      expect(data.shape).toEqual([4, 1])
      expect(Array.from(data.buffer)).toEqual([0, 1, 0, 0])
    })

    test('vdot and tensordot consistency', () => {
      const a = array([1, 2, 3])
      const b = array([4, 5, 6])

      const vdotResult = vdot(a, b)

      // Reshape for tensordot
      const a2d = array([[1, 2, 3]])
      const b2d = array([[4], [5], [6]])
      const tensorResult = tensordot(a2d, b2d, 1)

      expect(vdotResult).toBe(32)
      expect(tensorResult.getData().buffer[0]).toBe(32)
    })
  })
})
