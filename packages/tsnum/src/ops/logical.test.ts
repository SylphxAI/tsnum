import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { all, any, logicalAnd, logicalNot, logicalOr, logicalXor, where } from './logical'

describe('Logical Operations', () => {
  test('any: returns true if any element is non-zero', () => {
    expect(any(array([0, 0, 1, 0]))).toBe(true)
    expect(any(array([0, 0, 0, 0]))).toBe(false)
    expect(any(array([1, 2, 3]))).toBe(true)
  })

  test('all: returns true if all elements are non-zero', () => {
    expect(all(array([1, 2, 3]))).toBe(true)
    expect(all(array([1, 0, 3]))).toBe(false)
    expect(all(array([0, 0, 0]))).toBe(false)
  })

  test('logicalAnd: element-wise AND', () => {
    const a = array([1, 1, 0, 0])
    const b = array([1, 0, 1, 0])
    const result = logicalAnd(a, b)
    expect(Array.from(result.getData().buffer)).toEqual([1, 0, 0, 0])
  })

  test('logicalOr: element-wise OR', () => {
    const a = array([1, 1, 0, 0])
    const b = array([1, 0, 1, 0])
    const result = logicalOr(a, b)
    expect(Array.from(result.getData().buffer)).toEqual([1, 1, 1, 0])
  })

  test('logicalNot: element-wise NOT', () => {
    const a = array([1, 0, 5, 0])
    const result = logicalNot(a)
    expect(Array.from(result.getData().buffer)).toEqual([0, 1, 0, 1])
  })

  test('logicalXor: element-wise XOR', () => {
    const a = array([1, 1, 0, 0])
    const b = array([1, 0, 1, 0])
    const result = logicalXor(a, b)
    expect(Array.from(result.getData().buffer)).toEqual([0, 1, 1, 0])
  })

  test('where: conditional selection', () => {
    const condition = array([1, 0, 1, 0])
    const x = array([10, 20, 30, 40])
    const y = array([100, 200, 300, 400])
    const result = where(condition, x, y)
    expect(Array.from(result.getData().buffer)).toEqual([10, 200, 30, 400])
  })

  test('works with 2D arrays', () => {
    const a = array([
      [1, 0],
      [0, 1],
    ])
    expect(any(a)).toBe(true)
    expect(all(a)).toBe(false)
  })
})
