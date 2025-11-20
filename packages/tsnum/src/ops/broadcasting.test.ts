import { describe, expect, test } from 'bun:test'
import { array, ones, zeros } from '../creation'
import { add, at, mul, sub } from '../index'

describe('Broadcasting - Scalar', () => {
  test('1D array + scalar', () => {
    const arr = array([1, 2, 3])
    const result = add(arr, 10)

    expect(result.shape).toEqual([3])
    expect(at(result, 0)).toBe(11)
    expect(at(result, 1)).toBe(12)
    expect(at(result, 2)).toBe(13)
  })

  test('2D array * scalar', () => {
    const arr = array([
      [1, 2],
      [3, 4],
    ])
    const result = mul(arr, 2)

    expect(result.shape).toEqual([2, 2])
    expect(at(result, 0, 0)).toBe(2)
    expect(at(result, 0, 1)).toBe(4)
    expect(at(result, 1, 0)).toBe(6)
    expect(at(result, 1, 1)).toBe(8)
  })
})

describe('Broadcasting - 1D to 2D', () => {
  test('(3,) + (2, 3) - broadcast row', () => {
    const a = array([1, 2, 3])
    const b = array([
      [10, 20, 30],
      [40, 50, 60],
    ])
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11) // 1 + 10
    expect(at(result, 0, 1)).toBe(22) // 2 + 20
    expect(at(result, 0, 2)).toBe(33) // 3 + 30
    expect(at(result, 1, 0)).toBe(41) // 1 + 40
    expect(at(result, 1, 1)).toBe(52) // 2 + 50
    expect(at(result, 1, 2)).toBe(63) // 3 + 60
  })

  test('(2, 3) + (3,) - broadcast row (commutative)', () => {
    const a = array([
      [10, 20, 30],
      [40, 50, 60],
    ])
    const b = array([1, 2, 3])
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11)
    expect(at(result, 1, 2)).toBe(63)
  })
})

describe('Broadcasting - Shape (1, n) and (m, 1)', () => {
  test('(3, 1) + (1, 4) -> (3, 4)', () => {
    const a = array([[1], [2], [3]]) // Column vector
    const b = array([[10, 20, 30, 40]]) // Row vector
    const result = add(a, b)

    expect(result.shape).toEqual([3, 4])
    // First row: [1+10, 1+20, 1+30, 1+40] = [11, 21, 31, 41]
    expect(at(result, 0, 0)).toBe(11)
    expect(at(result, 0, 3)).toBe(41)
    // Second row: [2+10, 2+20, 2+30, 2+40] = [12, 22, 32, 42]
    expect(at(result, 1, 0)).toBe(12)
    expect(at(result, 1, 3)).toBe(42)
    // Third row: [3+10, 3+20, 3+30, 3+40] = [13, 23, 33, 43]
    expect(at(result, 2, 0)).toBe(13)
    expect(at(result, 2, 3)).toBe(43)
  })
})

describe('Broadcasting - Same shape broadcasting', () => {
  test('(2, 3) + (2, 3) - no broadcasting', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const b = array([
      [10, 20, 30],
      [40, 50, 60],
    ])
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11)
    expect(at(result, 1, 2)).toBe(66)
  })
})

describe('Broadcasting - Size 1 dimensions', () => {
  test('(2, 1) + (2, 3) - broadcast column', () => {
    const a = array([[1], [2]])
    const b = array([
      [10, 20, 30],
      [40, 50, 60],
    ])
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11) // 1 + 10
    expect(at(result, 0, 1)).toBe(21) // 1 + 20
    expect(at(result, 0, 2)).toBe(31) // 1 + 30
    expect(at(result, 1, 0)).toBe(42) // 2 + 40
    expect(at(result, 1, 1)).toBe(52) // 2 + 50
    expect(at(result, 1, 2)).toBe(62) // 2 + 60
  })

  test('(2, 3) + (1, 3) - broadcast row', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const b = array([[10, 20, 30]])
    const result = add(a, b)

    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11)
    expect(at(result, 1, 2)).toBe(36)
  })
})

describe('Broadcasting - Practical examples', () => {
  test('Normalize rows (subtract row mean)', () => {
    const data = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const rowMeans = array([[2], [5]]) // Mean of each row
    const normalized = sub(data, rowMeans)

    expect(normalized.shape).toEqual([2, 3])
    expect(at(normalized, 0, 0)).toBe(-1) // 1 - 2
    expect(at(normalized, 0, 1)).toBe(0) // 2 - 2
    expect(at(normalized, 0, 2)).toBe(1) // 3 - 2
    expect(at(normalized, 1, 0)).toBe(-1) // 4 - 5
    expect(at(normalized, 1, 1)).toBe(0) // 5 - 5
    expect(at(normalized, 1, 2)).toBe(1) // 6 - 5
  })

  test('Add bias to each column', () => {
    const weights = array([
      [1, 2],
      [3, 4],
      [5, 6],
    ]) // 3x2
    const bias = array([10, 20]) // 1D: (2,)
    const result = add(weights, bias)

    expect(result.shape).toEqual([3, 2])
    expect(at(result, 0, 0)).toBe(11) // 1 + 10
    expect(at(result, 0, 1)).toBe(22) // 2 + 20
    expect(at(result, 1, 0)).toBe(13) // 3 + 10
    expect(at(result, 2, 1)).toBe(26) // 6 + 20
  })
})

describe('Broadcasting - Valid edge case', () => {
  test('(1, 3) + (2, 1) -> (2, 3) is valid', () => {
    const a = array([[1, 2, 3]]) // (1, 3)
    const b = array([[10], [20]]) // (2, 1)

    // This IS valid broadcasting: (1,3) + (2,1) -> (2,3)
    const result = add(a, b)
    expect(result.shape).toEqual([2, 3])
    expect(at(result, 0, 0)).toBe(11) // 1 + 10
    expect(at(result, 0, 2)).toBe(13) // 3 + 10
    expect(at(result, 1, 0)).toBe(21) // 1 + 20
    expect(at(result, 1, 2)).toBe(23) // 3 + 20
  })
})

describe('Broadcasting - Invalid cases', () => {
  test('incompatible shapes throw error', () => {
    const a = array([1, 2, 3]) // (3,)
    const b = array([1, 2]) // (2,)

    // These shapes cannot broadcast: 3 vs 2 (neither is 1)
    expect(() => add(a, b)).toThrow('cannot be broadcast')
  })

  test('incompatible 2D shapes', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ]) // (2, 3)
    const b = array([
      [1, 2],
      [3, 4],
    ]) // (2, 2)

    // Cannot broadcast: 3 vs 2 in last dimension
    expect(() => add(a, b)).toThrow('cannot be broadcast')
  })
})
