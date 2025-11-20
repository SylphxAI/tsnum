import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { at, slice, take } from './indexing'

describe('Element Access (at)', () => {
  test('1D array - positive indices', () => {
    const arr = array([10, 20, 30, 40, 50])
    expect(at(arr, 0)).toBe(10)
    expect(at(arr, 2)).toBe(30)
    expect(at(arr, 4)).toBe(50)
  })

  test('1D array - negative indices', () => {
    const arr = array([10, 20, 30, 40, 50])
    expect(at(arr, -1)).toBe(50)
    expect(at(arr, -2)).toBe(40)
    expect(at(arr, -5)).toBe(10)
  })

  test('2D array - element access', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(at(arr, 0, 0)).toBe(1)
    expect(at(arr, 0, 2)).toBe(3)
    expect(at(arr, 1, 1)).toBe(5)
    expect(at(arr, 1, 2)).toBe(6)
  })

  test('2D array - negative indices', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(at(arr, -1, -1)).toBe(6)
    expect(at(arr, -2, -3)).toBe(1)
    expect(at(arr, 0, -1)).toBe(3)
  })

  test('throws on wrong number of indices', () => {
    const arr = array([
      [1, 2],
      [3, 4],
    ])
    expect(() => at(arr, 0)).toThrow('Expected 2 indices, got 1')
  })

  test('throws on out of bounds', () => {
    const arr = array([1, 2, 3])
    expect(() => at(arr, 5)).toThrow('out of bounds')
    expect(() => at(arr, -10)).toThrow('out of bounds')
  })
})

describe('Slicing (slice)', () => {
  test('1D array - basic slice', () => {
    const arr = array([0, 1, 2, 3, 4, 5])
    const s = slice(arr, [1, 4])

    expect(s.shape).toEqual([3])
    expect(at(s, 0)).toBe(1)
    expect(at(s, 1)).toBe(2)
    expect(at(s, 2)).toBe(3)
  })

  test('1D array - slice with step', () => {
    const arr = array([0, 1, 2, 3, 4, 5])
    const s = slice(arr, [0, 6, 2])

    expect(s.shape).toEqual([3])
    expect(at(s, 0)).toBe(0)
    expect(at(s, 1)).toBe(2)
    expect(at(s, 2)).toBe(4)
  })

  test('1D array - single index slice', () => {
    const arr = array([10, 20, 30, 40])
    const s = slice(arr, 2)

    expect(s.shape).toEqual([1])
    expect(at(s, 0)).toBe(30)
  })

  test('2D array - slice rows', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])
    const s = slice(arr, [0, 2])

    expect(s.shape).toEqual([2, 3])
    expect(at(s, 0, 0)).toBe(1)
    expect(at(s, 1, 2)).toBe(6)
  })

  test('2D array - slice rows and columns', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])
    const s = slice(arr, [0, 2], [1, 3])

    expect(s.shape).toEqual([2, 2])
    expect(at(s, 0, 0)).toBe(2)
    expect(at(s, 0, 1)).toBe(3)
    expect(at(s, 1, 0)).toBe(5)
    expect(at(s, 1, 1)).toBe(6)
  })

  test('2D array - negative indices', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const s = slice(arr, [0, -1])

    expect(s.shape).toEqual([1, 3])
    expect(at(s, 0, 0)).toBe(1)
  })

  test('2D array - slice columns only', () => {
    const arr = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const s = slice(arr, [1, 2])

    expect(s.shape).toEqual([1, 3])
    expect(at(s, 0, 0)).toBe(4)
    expect(at(s, 0, 1)).toBe(5)
    expect(at(s, 0, 2)).toBe(6)
  })
})

describe('Fancy Indexing (take)', () => {
  test('1D array - take specific indices', () => {
    const arr = array([10, 20, 30, 40, 50])
    const result = take(arr, [0, 2, 4])

    expect(result.shape).toEqual([3])
    expect(at(result, 0)).toBe(10)
    expect(at(result, 1)).toBe(30)
    expect(at(result, 2)).toBe(50)
  })

  test('1D array - take with negative indices', () => {
    const arr = array([10, 20, 30, 40, 50])
    const result = take(arr, [-1, -2, 0])

    expect(result.shape).toEqual([3])
    expect(at(result, 0)).toBe(50)
    expect(at(result, 1)).toBe(40)
    expect(at(result, 2)).toBe(10)
  })

  test('1D array - take with duplicates', () => {
    const arr = array([10, 20, 30])
    const result = take(arr, [0, 0, 1, 1, 2])

    expect(result.shape).toEqual([5])
    expect(at(result, 0)).toBe(10)
    expect(at(result, 1)).toBe(10)
    expect(at(result, 2)).toBe(20)
  })

  test('throws on out of bounds', () => {
    const arr = array([1, 2, 3])
    expect(() => take(arr, [0, 5])).toThrow('out of bounds')
  })
})
