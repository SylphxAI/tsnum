import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { add, div, mean, mul, reshape, sub, sum, transpose } from './index'

describe('Functional API', () => {
  test('add function', () => {
    const a = array([1, 2, 3])
    const b = add(a, 10)
    expect(b.get(0)).toBe(11)
    expect(b.get(2)).toBe(13)
  })

  test('sub function', () => {
    const a = array([10, 20, 30])
    const b = sub(a, 5)
    expect(b.get(0)).toBe(5)
    expect(b.get(2)).toBe(25)
  })

  test('mul function', () => {
    const a = array([1, 2, 3])
    const b = mul(a, 2)
    expect(b.get(1)).toBe(4)
  })

  test('div function', () => {
    const a = array([10, 20, 30])
    const b = div(a, 10)
    expect(b.get(0)).toBe(1)
  })

  test('sum function', () => {
    const a = array([1, 2, 3, 4])
    expect(sum(a)).toBe(10)
  })

  test('mean function', () => {
    const a = array([2, 4, 6, 8])
    expect(mean(a)).toBe(5)
  })

  test('reshape function', () => {
    const a = array([1, 2, 3, 4, 5, 6])
    const b = reshape(a, [2, 3])
    expect(b.shape).toEqual([2, 3])
    expect(b.get(1, 2)).toBe(6)
  })

  test('transpose function', () => {
    const a = array([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const b = transpose(a)
    expect(b.shape).toEqual([3, 2])
    expect(b.get(0, 1)).toBe(4)
  })
})
