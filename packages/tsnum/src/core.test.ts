import { describe, expect, test } from 'bun:test'
import {
  add,
  arange,
  array,
  div,
  equal,
  eye,
  flatten,
  greater,
  less,
  linspace,
  max,
  mean,
  min,
  mul,
  ones,
  pipe,
  pow,
  reshape,
  std,
  sub,
  sum,
  transpose,
  variance,
  zeros,
} from './index'

describe('Array Creation', () => {
  test('create 1D array from data', () => {
    const a = array([1, 2, 3])
    expect(a.shape).toEqual([3])
    expect(a.size).toBe(3)
  })

  test('create 2D array from data', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    expect(a.shape).toEqual([2, 2])
    expect(a.size).toBe(4)
  })

  test('create zeros array', () => {
    const a = zeros([2, 3])
    expect(a.shape).toEqual([2, 3])
    expect(sum(a)).toBe(0)
  })

  test('create ones array', () => {
    const a = ones([2, 2])
    expect(a.shape).toEqual([2, 2])
    expect(sum(a)).toBe(4)
  })

  test('create arange array', () => {
    const a = arange(5)
    expect(a.shape).toEqual([5])
    expect(sum(a)).toBe(10) // 0+1+2+3+4

    const b = arange(2, 8, 2)
    expect(b.shape).toEqual([3])
    expect(sum(b)).toBe(12) // 2+4+6
  })

  test('create linspace array', () => {
    const a = linspace(0, 1, 5)
    expect(a.shape).toEqual([5])
  })

  test('create eye (identity) matrix', () => {
    const a = eye(3)
    expect(a.shape).toEqual([3, 3])
    expect(sum(a)).toBe(3) // diagonal 1s
  })
})

describe('Arithmetic Operations (Functional)', () => {
  test('add scalar', () => {
    const a = array([1, 2, 3])
    const b = add(a, 10)
    expect(sum(b)).toBe(36) // 11+12+13
  })

  test('add arrays', () => {
    const a = array([1, 2, 3])
    const b = array([4, 5, 6])
    const c = add(a, b)
    expect(sum(c)).toBe(21) // 5+7+9
  })

  test('subtract scalar', () => {
    const a = array([10, 20, 30])
    const b = sub(a, 5)
    expect(sum(b)).toBe(45) // 5+15+25
  })

  test('multiply scalar', () => {
    const a = array([1, 2, 3])
    const b = mul(a, 2)
    expect(sum(b)).toBe(12) // 2+4+6
  })

  test('divide scalar', () => {
    const a = array([10, 20, 30])
    const b = div(a, 10)
    expect(sum(b)).toBe(6) // 1+2+3
  })

  test('power', () => {
    const a = array([2, 3, 4])
    const b = pow(a, 2)
    expect(sum(b)).toBe(29) // 4+9+16
  })
})

describe('Comparison Operations (Functional)', () => {
  test('equal comparison', () => {
    const a = array([1, 2, 3])
    const b = equal(a, 2)
    expect(sum(b)).toBe(1) // only middle element equals 2
  })

  test('less than comparison', () => {
    const a = array([1, 2, 3])
    const b = less(a, 3)
    expect(sum(b)).toBe(2) // 1 and 2 are less than 3
  })

  test('greater than comparison', () => {
    const a = array([1, 2, 3])
    const b = greater(a, 1)
    expect(sum(b)).toBe(2) // 2 and 3 are greater than 1
  })
})

describe('Reduction Operations (Functional)', () => {
  test('sum all elements', () => {
    const a = array([1, 2, 3, 4])
    expect(sum(a)).toBe(10)
  })

  test('mean of elements', () => {
    const a = array([2, 4, 6, 8])
    expect(mean(a)).toBe(5)
  })

  test('max element', () => {
    const a = array([3, 7, 2, 9, 1])
    expect(max(a)).toBe(9)
  })

  test('min element', () => {
    const a = array([3, 7, 2, 9, 1])
    expect(min(a)).toBe(1)
  })

  test('std (standard deviation)', () => {
    const a = array([2, 4, 6, 8])
    const result = std(a)
    expect(result).toBeGreaterThan(2)
  })

  test('variance', () => {
    const a = array([2, 4, 6, 8])
    const result = variance(a)
    expect(result).toBe(5) // Variance of [2,4,6,8] is exactly 5
  })
})

describe('Shape Operations (Functional)', () => {
  test('reshape array', () => {
    const a = arange(6)
    const b = reshape(a, [2, 3])
    expect(b.shape).toEqual([2, 3])
    expect(sum(b)).toBe(15) // 0+1+2+3+4+5
  })

  test('flatten array', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    const b = flatten(a)
    expect(b.shape).toEqual([4])
    expect(sum(b)).toBe(10)
  })

  test('transpose 2D array', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const b = transpose(a)
    expect(b.shape).toEqual([3, 2])
    expect(sum(b)).toBe(21)
  })

  test('transpose via .T property', () => {
    const a = array([
      [1, 2],
      [3, 4],
    ])
    const b = a.T
    expect(b.shape).toEqual([2, 2])
    expect(sum(b)).toBe(10)
  })
})

describe('Functional Composition with pipe', () => {
  test('pipe simple operations', () => {
    const result = pipe(
      array([1, 2, 3]),
      (a) => add(a, 1),
      (a) => mul(a, 2),
      sum,
    )
    expect(result).toBe(18) // (1+1)*2 + (2+1)*2 + (3+1)*2 = 4+6+8 = 18
  })

  test('pipe with shape operations', () => {
    const result = pipe(
      array([
        [1, 2],
        [3, 4],
      ]),
      flatten,
      (a) => add(a, 10),
      (a) => mul(a, 2),
      sum,
    )
    expect(result).toBe(100) // (1+10)*2 + (2+10)*2 + (3+10)*2 + (4+10)*2
  })

  test('pipe with reshape and transpose', () => {
    const result = pipe(
      arange(6),
      (a) => reshape(a, [2, 3]),
      transpose,
      (a) => add(a, 1),
      sum,
    )
    expect(result).toBe(21) // (0+1+2+3+4+5) + 6 = 21
  })
})

describe('Copy and Immutability', () => {
  test('operations return new arrays', () => {
    const a = array([1, 2, 3])
    const b = add(a, 1)
    expect(sum(a)).toBe(6) // Original unchanged
    expect(sum(b)).toBe(9) // New array
  })

  test('copy creates independent array', () => {
    const a = array([1, 2, 3])
    const b = a.copy()
    expect(sum(b)).toBe(6)
    expect(a.shape).toEqual(b.shape)
  })
})

describe('NumPy-style Usage', () => {
  test('normalize data (functional style)', () => {
    const data = array([1, 2, 3, 4, 5])
    const normalized = pipe(
      data,
      (d) => sub(d, mean(d)),
      (d) => div(d, 2), // simplified std
    )
    expect(normalized.shape).toEqual([5])
  })

  test('matrix operations', () => {
    const x = array([
      [1, 2],
      [3, 4],
    ])
    const result = pipe(x, transpose, (m) => add(m, 10), sum)
    expect(result).toBe(50) // (1+3+2+4) + 40
  })
})
