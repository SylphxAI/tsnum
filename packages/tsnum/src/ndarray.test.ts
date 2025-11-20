import { describe, expect, test } from 'bun:test'
import { arange, array, eye, linspace, ones, zeros } from './creation'

describe('Array Creation', () => {
  test('create 1D array from data', () => {
    const a = array([1, 2, 3])
    expect(a.shape).toEqual([3])
    expect(a.get(0)).toBe(1)
    expect(a.get(1)).toBe(2)
    expect(a.get(2)).toBe(3)
  })

  test('create 2D array from data', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    expect(a.shape).toEqual([2, 2])
    expect(a.get(0, 0)).toBe(1)
    expect(a.get(0, 1)).toBe(2)
    expect(a.get(1, 0)).toBe(3)
    expect(a.get(1, 1)).toBe(4)
  })

  test('create zeros array', () => {
    const a = zeros([2, 3])
    expect(a.shape).toEqual([2, 3])
    expect(a.get(0, 0)).toBe(0)
    expect(a.get(1, 2)).toBe(0)
  })

  test('create ones array', () => {
    const a = ones([2, 2])
    expect(a.shape).toEqual([2, 2])
    expect(a.get(0, 0)).toBe(1)
    expect(a.get(1, 1)).toBe(1)
  })

  test('create arange array', () => {
    const a = arange(5)
    expect(a.shape).toEqual([5])
    expect(a.get(0)).toBe(0)
    expect(a.get(4)).toBe(4)

    const b = arange(2, 8, 2)
    expect(b.shape).toEqual([3])
    expect(b.get(0)).toBe(2)
    expect(b.get(1)).toBe(4)
    expect(b.get(2)).toBe(6)
  })

  test('create linspace array', () => {
    const a = linspace(0, 1, 5)
    expect(a.shape).toEqual([5])
    expect(a.get(0)).toBe(0)
    expect(a.get(4)).toBe(1)
    expect(a.get(2)).toBeCloseTo(0.5)
  })

  test('create eye (identity) matrix', () => {
    const a = eye(3)
    expect(a.shape).toEqual([3, 3])
    expect(a.get(0, 0)).toBe(1)
    expect(a.get(1, 1)).toBe(1)
    expect(a.get(2, 2)).toBe(1)
    expect(a.get(0, 1)).toBe(0)
    expect(a.get(1, 0)).toBe(0)
  })
})

describe('Arithmetic Operations', () => {
  test('add scalar', () => {
    const a = array([1, 2, 3])
    const b = a.add(10)
    expect(b.get(0)).toBe(11)
    expect(b.get(1)).toBe(12)
    expect(b.get(2)).toBe(13)
  })

  test('add arrays', () => {
    const a = array([1, 2, 3])
    const b = array([4, 5, 6])
    const c = a.add(b)
    expect(c.get(0)).toBe(5)
    expect(c.get(1)).toBe(7)
    expect(c.get(2)).toBe(9)
  })

  test('subtract scalar', () => {
    const a = array([10, 20, 30])
    const b = a.sub(5)
    expect(b.get(0)).toBe(5)
    expect(b.get(1)).toBe(15)
    expect(b.get(2)).toBe(25)
  })

  test('multiply scalar', () => {
    const a = array([1, 2, 3])
    const b = a.mul(2)
    expect(b.get(0)).toBe(2)
    expect(b.get(1)).toBe(4)
    expect(b.get(2)).toBe(6)
  })

  test('divide scalar', () => {
    const a = array([10, 20, 30])
    const b = a.div(10)
    expect(b.get(0)).toBe(1)
    expect(b.get(1)).toBe(2)
    expect(b.get(2)).toBe(3)
  })

  test('power', () => {
    const a = array([2, 3, 4])
    const b = a.pow(2)
    expect(b.get(0)).toBe(4)
    expect(b.get(1)).toBe(9)
    expect(b.get(2)).toBe(16)
  })
})

describe('Comparison Operations', () => {
  test('equal comparison', () => {
    const a = array([1, 2, 3])
    const b = a.eq(2)
    expect(b.get(0)).toBe(0)
    expect(b.get(1)).toBe(1)
    expect(b.get(2)).toBe(0)
  })

  test('less than comparison', () => {
    const a = array([1, 2, 3])
    const b = a.lt(3)
    expect(b.get(0)).toBe(1)
    expect(b.get(1)).toBe(1)
    expect(b.get(2)).toBe(0)
  })

  test('greater than comparison', () => {
    const a = array([1, 2, 3])
    const b = a.gt(1)
    expect(b.get(0)).toBe(0)
    expect(b.get(1)).toBe(1)
    expect(b.get(2)).toBe(1)
  })
})

describe('Reduction Operations', () => {
  test('sum all elements', () => {
    const a = array([1, 2, 3, 4])
    expect(a.sum()).toBe(10)
  })

  test('mean of elements', () => {
    const a = array([2, 4, 6, 8])
    expect(a.mean()).toBe(5)
  })

  test('max element', () => {
    const a = array([3, 7, 2, 9, 1])
    expect(a.max()).toBe(9)
  })

  test('min element', () => {
    const a = array([3, 7, 2, 9, 1])
    expect(a.min()).toBe(1)
  })
})

describe('Shape Operations', () => {
  test('reshape array', () => {
    const a = arange(6)
    const b = a.reshape([2, 3])
    expect(b.shape).toEqual([2, 3])
    expect(b.get(0, 0)).toBe(0)
    expect(b.get(1, 2)).toBe(5)
  })

  test('flatten array', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    const b = a.flatten()
    expect(b.shape).toEqual([4])
    expect(b.get(0)).toBe(1)
    expect(b.get(3)).toBe(4)
  })

  test('transpose 2D array', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const b = a.transpose()
    expect(b.shape).toEqual([3, 2])
    expect(b.get(0, 0)).toBe(1)
    expect(b.get(0, 1)).toBe(4)
    expect(b.get(2, 1)).toBe(6)
  })

  test('transpose via .T property', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    const b = a.T
    expect(b.shape).toEqual([2, 2])
    expect(b.get(0, 1)).toBe(3)
    expect(b.get(1, 0)).toBe(2)
  })
})

describe('Chaining Operations', () => {
  test('chain arithmetic operations', () => {
    const a = array([1, 2, 3])
    const result = a.add(1).mul(2).sub(4)
    expect(result.get(0)).toBe(0) // (1+1)*2-4 = 0
    expect(result.get(1)).toBe(2) // (2+1)*2-4 = 2
    expect(result.get(2)).toBe(4) // (3+1)*2-4 = 4
  })

  test('chain shape and arithmetic', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    const result = a.flatten().add(10).mul(2)
    expect(result.shape).toEqual([4])
    expect(result.get(0)).toBe(22) // (1+10)*2
    expect(result.get(3)).toBe(28) // (4+10)*2
  })
})

describe('Copy and Immutability', () => {
  test('operations return new arrays', () => {
    const a = array([1, 2, 3])
    const b = a.add(1)
    expect(a.get(0)).toBe(1) // Original unchanged
    expect(b.get(0)).toBe(2) // New array modified
  })

  test('copy creates independent array', () => {
    const a = array([1, 2, 3])
    const b = a.copy()
    expect(b.get(0)).toBe(1)
    expect(a.shape).toEqual(b.shape)
  })
})
