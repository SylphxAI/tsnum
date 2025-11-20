import { describe, expect, test } from 'bun:test'
import { array } from './creation'
import { tril, triu } from './creation-triangular'

describe('Triangular Matrix Functions', () => {
  describe('tril', () => {
    test('tril - default (main diagonal)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = tril(arr)
      const data = result.getData()

      expect(data.shape).toEqual([3, 3])
      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 4, 5, 0, 7, 8, 9])
    })

    test('tril - k=1 (one diagonal above)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = tril(arr, 1)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 2, 0, 4, 5, 6, 7, 8, 9])
    })

    test('tril - k=-1 (one diagonal below)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = tril(arr, -1)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([0, 0, 0, 4, 0, 0, 7, 8, 0])
    })

    test('tril - rectangular matrix (tall)', () => {
      const arr = array([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ])
      const result = tril(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4, 2])
      expect(Array.from(data.buffer)).toEqual([1, 0, 3, 4, 5, 6, 7, 8])
    })

    test('tril - rectangular matrix (wide)', () => {
      const arr = array([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ])
      const result = tril(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 0, 5, 6, 0, 0])
    })

    test('tril - identity matrix', () => {
      const arr = array([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
      const result = tril(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1])
    })

    test('tril - k=2 (two diagonals above)', () => {
      const arr = array([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ])
      const result = tril(arr, 2)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    })

    test('tril - 1D array error', () => {
      const arr = array([1, 2, 3])
      expect(() => tril(arr)).toThrow('2D')
    })

    test('tril - 2x2 matrix', () => {
      const arr = array([
        [1, 2],
        [3, 4],
      ])
      const result = tril(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 0, 3, 4])
    })
  })

  describe('triu', () => {
    test('triu - default (main diagonal)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = triu(arr)
      const data = result.getData()

      expect(data.shape).toEqual([3, 3])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 0, 5, 6, 0, 0, 9])
    })

    test('triu - k=1 (one diagonal above)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = triu(arr, 1)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([0, 2, 3, 0, 0, 6, 0, 0, 0])
    })

    test('triu - k=-1 (one diagonal below)', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      const result = triu(arr, -1)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4, 5, 6, 0, 8, 9])
    })

    test('triu - rectangular matrix (tall)', () => {
      const arr = array([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ])
      const result = triu(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4, 2])
      expect(Array.from(data.buffer)).toEqual([1, 2, 0, 4, 0, 0, 0, 0])
    })

    test('triu - rectangular matrix (wide)', () => {
      const arr = array([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ])
      const result = triu(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4, 0, 6, 7, 8])
    })

    test('triu - identity matrix', () => {
      const arr = array([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
      const result = triu(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1])
    })

    test('triu - k=2 (two diagonals above)', () => {
      const arr = array([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ])
      const result = triu(arr, 2)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([0, 0, 3, 4, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0])
    })

    test('triu - 1D array error', () => {
      const arr = array([1, 2, 3])
      expect(() => triu(arr)).toThrow('2D')
    })

    test('triu - 2x2 matrix', () => {
      const arr = array([
        [1, 2],
        [3, 4],
      ])
      const result = triu(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 2, 0, 4])
    })
  })

  describe('Integration - tril and triu', () => {
    test('tril + triu with k=1 and k=-1 cover matrix', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])

      const lower = tril(arr)
      const upper = triu(arr)

      const lowerData = lower.getData()
      const upperData = upper.getData()

      // Reconstruct diagonal
      const diagonal = []
      for (let i = 0; i < 3; i++) {
        diagonal.push(lowerData.buffer[i * 3 + i])
      }

      expect(diagonal).toEqual([1, 5, 9])

      // Verify upper triangle is zero in lower
      expect(lowerData.buffer[1]).toBe(0) // row 0, col 1
      expect(lowerData.buffer[2]).toBe(0) // row 0, col 2

      // Verify lower triangle is zero in upper
      expect(upperData.buffer[3]).toBe(0) // row 1, col 0
      expect(upperData.buffer[6]).toBe(0) // row 2, col 0
    })

    test('tril and triu complement each other', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])

      const lower = tril(arr, -1) // Strictly lower
      const upper = triu(arr) // Upper + diagonal

      const lowerData = lower.getData()
      const upperData = upper.getData()

      // No overlap
      for (let i = 0; i < 9; i++) {
        if (lowerData.buffer[i] !== 0 && upperData.buffer[i] !== 0) {
          throw new Error('Overlap detected')
        }
      }

      // Covers all elements
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += lowerData.buffer[i] + upperData.buffer[i]
      }
      expect(sum).toBe(45) // 1+2+...+9 = 45
    })
  })
})
