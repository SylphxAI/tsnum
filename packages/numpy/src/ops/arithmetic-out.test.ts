import { describe, expect, test } from 'bun:test'
import { array, empty } from '../creation'
import { add, multiply } from './arithmetic'

describe('Arithmetic out options', () => {
  test('add writes scalar result into provided out array', () => {
    const input = array([1, 2, 3], { dtype: 'float64' })
    const out = empty([3], { dtype: 'float64' })

    const result = add(input, 5, { out })

    expect(result).toBe(out)
    expect(Array.from(out.getData().buffer)).toEqual([6, 7, 8])
  })

  test('add writes same-shape array result into provided out array', () => {
    const left = array([1, 2, 3], { dtype: 'float64' })
    const right = array([4, 5, 6], { dtype: 'float64' })
    const out = empty([3], { dtype: 'float64' })

    const result = add(left, right, { out })

    expect(result).toBe(out)
    expect(Array.from(out.getData().buffer)).toEqual([5, 7, 9])
  })

  test('add writes broadcast result into provided out array', () => {
    const left = array(
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      { dtype: 'float64' },
    )
    const right = array([10, 20, 30], { dtype: 'float64' })
    const out = empty([2, 3], { dtype: 'float64' })

    const result = add(left, right, { out })

    expect(result).toBe(out)
    expect(Array.from(out.getData().buffer)).toEqual([11, 22, 33, 14, 25, 36])
  })

  test('multiply alias writes scalar result into provided out array', () => {
    const input = array([1, 2, 3], { dtype: 'float64' })
    const out = empty([3], { dtype: 'float64' })

    const result = multiply(input, 2, { out })

    expect(result).toBe(out)
    expect(Array.from(out.getData().buffer)).toEqual([2, 4, 6])
  })

  test('throws error for incompatible out shape', () => {
    const input = array([1, 2, 3], { dtype: 'float64' })
    const out = empty([2], { dtype: 'float64' })

    expect(() => add(input, 1, { out })).toThrow('operation out shape mismatch')
  })

  test('throws error for incompatible out dtype', () => {
    const input = array([1, 2, 3], { dtype: 'float64' })
    const out = empty([3], { dtype: 'float32' })

    expect(() => add(input, 1, { out })).toThrow('operation out dtype mismatch')
  })
})
