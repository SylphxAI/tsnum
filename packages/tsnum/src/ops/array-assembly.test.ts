import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { array_split, block, column_stack, dstack } from './array-assembly'

describe('Array Assembly', () => {
  describe('block', () => {
    test('block - 1D concatenation', () => {
      const a = array([1, 2])
      const b = array([3, 4])
      const result = block([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([4])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4])
    })

    test('block - 2D horizontal stacking', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5], [6]])
      const result = block([[a, b]])
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      expect(Array.from(data.buffer)).toEqual([1, 2, 5, 3, 4, 6])
    })

    test('block - 2D vertical stacking', () => {
      const a = array([[1, 2, 3]])
      const b = array([[4, 5, 6]])
      const result = block([[a], [b]])
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('block - 2D grid assembly', () => {
      const a = array([[1, 2]])
      const b = array([[3, 4]])
      const c = array([[5, 6]])
      const d = array([[7, 8]])
      const result = block([[a, b], [c, d]])
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    test('block - empty array', () => {
      expect(() => block([])).toThrow()
    })

    test('block - shape mismatch', () => {
      const a = array([[1, 2]])
      const b = array([[3, 4, 5]]) // Different shape
      expect(() => block([[a], [b]])).toThrow()
    })
  })

  describe('column_stack', () => {
    test('column_stack - 1D arrays', () => {
      const a = array([1, 2, 3])
      const b = array([4, 5, 6])
      const result = column_stack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([3, 2])
      expect(Array.from(data.buffer)).toEqual([1, 4, 2, 5, 3, 6])
    })

    test('column_stack - 2D arrays', () => {
      const a = array([[1], [2], [3]])
      const b = array([[4], [5], [6]])
      const result = column_stack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([3, 2])
      expect(Array.from(data.buffer)).toEqual([1, 4, 2, 5, 3, 6])
    })

    test('column_stack - mixed 1D and 2D', () => {
      const a = array([1, 2, 3])
      const b = array([[4, 5], [6, 7], [8, 9]])
      const result = column_stack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([3, 3])
      expect(Array.from(data.buffer)).toEqual([1, 4, 5, 2, 6, 7, 3, 8, 9])
    })

    test('column_stack - single array', () => {
      const a = array([1, 2, 3])
      const result = column_stack([a])
      const data = result.getData()

      expect(data.shape).toEqual([3, 1])
    })

    test('column_stack - empty array', () => {
      expect(() => column_stack([])).toThrow()
    })

    test('column_stack - 3D array error', () => {
      const a = array([[[1]]])
      expect(() => column_stack([a])).toThrow()
    })
  })

  describe('array_split', () => {
    test('array_split - equal sections', () => {
      const arr = array([1, 2, 3, 4, 5, 6])
      const result = array_split(arr, 3)

      expect(result.length).toBe(3)
      expect(Array.from(result[0].getData().buffer)).toEqual([1, 2])
      expect(Array.from(result[1].getData().buffer)).toEqual([3, 4])
      expect(Array.from(result[2].getData().buffer)).toEqual([5, 6])
    })

    test('array_split - unequal sections', () => {
      const arr = array([1, 2, 3, 4, 5, 6, 7])
      const result = array_split(arr, 3)

      expect(result.length).toBe(3)
      expect(Array.from(result[0].getData().buffer)).toEqual([1, 2, 3])
      expect(Array.from(result[1].getData().buffer)).toEqual([4, 5])
      expect(Array.from(result[2].getData().buffer)).toEqual([6, 7])
    })

    test('array_split - at specific indices', () => {
      const arr = array([1, 2, 3, 4, 5, 6, 7, 8])
      const result = array_split(arr, [2, 5])

      expect(result.length).toBe(3)
      expect(Array.from(result[0].getData().buffer)).toEqual([1, 2])
      expect(Array.from(result[1].getData().buffer)).toEqual([3, 4, 5])
      expect(Array.from(result[2].getData().buffer)).toEqual([6, 7, 8])
    })

    test('array_split - 2D along axis 0', () => {
      const arr = array([[1, 2], [3, 4], [5, 6], [7, 8]])
      const result = array_split(arr, 2, 0)

      expect(result.length).toBe(2)
      expect(result[0].getData().shape).toEqual([2, 2])
      expect(result[1].getData().shape).toEqual([2, 2])
    })

    test('array_split - 2D along axis 1', () => {
      const arr = array([[1, 2, 3, 4], [5, 6, 7, 8]])
      const result = array_split(arr, 2, 1)

      expect(result.length).toBe(2)
      expect(result[0].getData().shape).toEqual([2, 2])
      expect(result[1].getData().shape).toEqual([2, 2])
    })

    test('array_split - invalid axis', () => {
      const arr = array([1, 2, 3])
      expect(() => array_split(arr, 2, 5)).toThrow()
    })
  })

  describe('dstack', () => {
    test('dstack - 1D arrays', () => {
      const a = array([1, 2])
      const b = array([3, 4])
      const result = dstack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([1, 2, 2])
      expect(Array.from(data.buffer)).toEqual([1, 3, 2, 4])
    })

    test('dstack - 2D arrays', () => {
      const a = array([[1, 2], [3, 4]])
      const b = array([[5, 6], [7, 8]])
      const result = dstack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2, 2])
      expect(Array.from(data.buffer)).toEqual([1, 5, 2, 6, 3, 7, 4, 8])
    })

    test('dstack - 3D arrays', () => {
      const a = array([[[1, 2]], [[3, 4]]])
      const b = array([[[5, 6]], [[7, 8]]])
      const result = dstack([a, b])
      const data = result.getData()

      expect(data.shape).toEqual([2, 1, 3])
    })

    test('dstack - single array', () => {
      const a = array([[1, 2], [3, 4]])
      const result = dstack([a])
      const data = result.getData()

      expect(data.shape).toEqual([2, 2, 1])
    })

    test('dstack - empty array', () => {
      expect(() => dstack([])).toThrow()
    })

    test('dstack - 4D array error', () => {
      const a = array([[[[1]]]])
      expect(() => dstack([a])).toThrow()
    })
  })
})
