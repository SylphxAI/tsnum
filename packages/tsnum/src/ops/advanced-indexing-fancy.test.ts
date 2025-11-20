import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { greater } from '../ops/comparison'
import { booleanIndex, integerArrayIndex } from './advanced-indexing'

describe('Advanced Indexing - Boolean and Integer Arrays', () => {
  describe('booleanIndex', () => {
    test('boolean indexing - basic', () => {
      const a = array([1, 2, 3, 4, 5])
      const mask = array([1, 0, 1, 0, 1])
      const result = booleanIndex(a, mask)

      expect(result.shape).toEqual([3])
      expect(Array.from(result.getData().buffer)).toEqual([1, 3, 5])
    })

    test('boolean indexing - all true', () => {
      const a = array([10, 20, 30])
      const mask = array([1, 1, 1])
      const result = booleanIndex(a, mask)

      expect(result.shape).toEqual([3])
      expect(Array.from(result.getData().buffer)).toEqual([10, 20, 30])
    })

    test('boolean indexing - all false', () => {
      const a = array([10, 20, 30])
      const mask = array([0, 0, 0])
      const result = booleanIndex(a, mask)

      expect(result.shape).toEqual([0])
      expect(Array.from(result.getData().buffer)).toEqual([])
    })

    test('boolean indexing - with comparison', () => {
      const a = array([1, 5, 3, 8, 2])
      const threshold = array([3, 3, 3, 3, 3])  // Same shape for comparison
      const mask = greater(a, threshold)  // Elements > 3
      const result = booleanIndex(a, mask)

      expect(result.shape).toEqual([2])
      expect(Array.from(result.getData().buffer)).toEqual([5, 8])
    })

    test('boolean indexing - size mismatch error', () => {
      const a = array([1, 2, 3])
      const mask = array([1, 0])

      expect(() => booleanIndex(a, mask)).toThrow('same size')
    })

    test('boolean indexing - float64 dtype', () => {
      const a = array([1.1, 2.2, 3.3, 4.4], { dtype: 'float64' })
      const mask = array([1, 0, 1, 0])
      const result = booleanIndex(a, mask)

      expect(result.getData().dtype).toBe('float64')
      expect(result.shape).toEqual([2])
      expect(result.getData().buffer[0]).toBeCloseTo(1.1)
      expect(result.getData().buffer[1]).toBeCloseTo(3.3)
    })
  })

  describe('integerArrayIndex', () => {
    test('integer array indexing - basic', () => {
      const a = array([10, 20, 30, 40, 50])
      const indices = array([0, 2, 4])
      const result = integerArrayIndex(a, indices)

      expect(result.shape).toEqual([3])
      expect(Array.from(result.getData().buffer)).toEqual([10, 30, 50])
    })

    test('integer array indexing - single index', () => {
      const a = array([100, 200, 300])
      const indices = array([1])
      const result = integerArrayIndex(a, indices)

      expect(result.shape).toEqual([1])
      expect(Array.from(result.getData().buffer)).toEqual([200])
    })

    test('integer array indexing - negative indices', () => {
      const a = array([10, 20, 30, 40, 50])
      const indices = array([-1, -2, -3])
      const result = integerArrayIndex(a, indices)

      expect(result.shape).toEqual([3])
      expect(Array.from(result.getData().buffer)).toEqual([50, 40, 30])
    })

    test('integer array indexing - repeated indices', () => {
      const a = array([5, 10, 15])
      const indices = array([1, 1, 0, 1])
      const result = integerArrayIndex(a, indices)

      expect(result.shape).toEqual([4])
      expect(Array.from(result.getData().buffer)).toEqual([10, 10, 5, 10])
    })

    test('integer array indexing - out of bounds error', () => {
      const a = array([1, 2, 3])
      const indices = array([0, 5])

      expect(() => integerArrayIndex(a, indices)).toThrow('out of bounds')
    })

    test('integer array indexing - negative out of bounds', () => {
      const a = array([1, 2, 3])
      const indices = array([-10])

      expect(() => integerArrayIndex(a, indices)).toThrow('out of bounds')
    })

    test('integer array indexing - 2D index array', () => {
      const a = array([100, 200, 300, 400])
      const indices = array([[0, 2], [1, 3]])
      const result = integerArrayIndex(a, indices)

      expect(result.shape).toEqual([2, 2])
      expect(Array.from(result.getData().buffer)).toEqual([100, 300, 200, 400])
    })

    test('integer array indexing - preserves dtype', () => {
      const a = array([1.5, 2.5, 3.5], { dtype: 'float64' })
      const indices = array([0, 2])
      const result = integerArrayIndex(a, indices)

      expect(result.getData().dtype).toBe('float64')
      expect(result.getData().buffer[0]).toBeCloseTo(1.5)
      expect(result.getData().buffer[1]).toBeCloseTo(3.5)
    })
  })

  describe('Integration - Boolean and Integer Indexing', () => {
    test('filter with boolean then reindex with integers', () => {
      // Find all values > 5, then take first 2
      const a = array([1, 8, 3, 9, 2, 7, 4])
      const threshold = array([5, 5, 5, 5, 5, 5, 5])
      const mask = greater(a, threshold)
      const filtered = booleanIndex(a, mask)  // [8, 9, 7]

      const indices = array([0, 2])
      const result = integerArrayIndex(filtered, indices)  // [8, 7]

      expect(Array.from(result.getData().buffer)).toEqual([8, 7])
    })

    test('practical use case - outlier removal', () => {
      const data = array([1, 2, 100, 3, 4, -50, 5])

      // Remove outliers (values outside -10 to 10)
      const inRange = array([1, 1, 0, 1, 1, 0, 1])
      const cleaned = booleanIndex(data, inRange)

      expect(Array.from(cleaned.getData().buffer)).toEqual([1, 2, 3, 4, 5])
    })

    test('practical use case - fancy reordering', () => {
      const values = array([100, 200, 300, 400, 500])

      // Reorder: last, first, middle
      const newOrder = array([4, 0, 2])
      const reordered = integerArrayIndex(values, newOrder)

      expect(Array.from(reordered.getData().buffer)).toEqual([500, 100, 300])
    })
  })
})
