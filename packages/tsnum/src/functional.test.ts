import { describe, expect, test } from 'bun:test'
import { array } from './creation'
import { compose, pipe } from './functional'
import { add, mul, sum } from './ops'

describe('Functional Utilities', () => {
  test('pipe with single function', () => {
    const a = array([1, 2, 3])
    const result = pipe(a, (arr) => add(arr, 1))
    expect(result.get(0)).toBe(2)
  })

  test('pipe with multiple functions', () => {
    const a = array([1, 2, 3])
    const result = pipe(
      a,
      (arr) => add(arr, 1),
      (arr) => mul(arr, 2),
      sum,
    )
    expect(result).toBe(18) // (1+1)*2 + (2+1)*2 + (3+1)*2 = 4+6+8 = 18
  })

  test('pipe with no functions returns value', () => {
    const a = array([1, 2, 3])
    const result = pipe(a)
    expect(result).toBe(a)
  })

  test('compose creates function', () => {
    const addOne = (arr: any) => add(arr, 1)
    const mulTwo = (arr: any) => mul(arr, 2)

    const composed = compose(mulTwo, addOne)

    const a = array([1, 2, 3])
    const result = composed(a)

    expect(result.get(0)).toBe(4) // (1+1)*2 = 4
    expect(result.get(2)).toBe(8) // (3+1)*2 = 8
  })
})
