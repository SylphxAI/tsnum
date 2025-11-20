import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import {
  abs,
  arccos,
  arcsin,
  arctan,
  ceil,
  clip,
  cos,
  exp,
  floor,
  log,
  log10,
  maximum,
  minimum,
  round,
  sign,
  sin,
  sqrt,
  tan,
  trunc,
} from './math'

describe('Math Functions', () => {
  test('abs: absolute value', () => {
    const a = array([-2, -1, 0, 1, 2])
    const result = abs(a)
    expect(Array.from(result.getData().buffer)).toEqual([2, 1, 0, 1, 2])
  })

  test('sign: sign of elements', () => {
    const a = array([-5, -0.1, 0, 0.1, 5], { dtype: 'float64' })
    const result = sign(a)
    expect(Array.from(result.getData().buffer)).toEqual([-1, -1, 0, 1, 1])
  })

  test('sqrt: square root', () => {
    const a = array([1, 4, 9, 16, 25])
    const result = sqrt(a)
    expect(Array.from(result.getData().buffer)).toEqual([1, 2, 3, 4, 5])
  })

  test('exp: exponential', () => {
    const a = array([0, 1, 2], { dtype: 'float64' })
    const result = exp(a)
    expect(result.getData().buffer[0]).toBeCloseTo(1, 5)
    expect(result.getData().buffer[1]).toBeCloseTo(Math.E, 5)
    expect(result.getData().buffer[2]).toBeCloseTo(Math.E ** 2, 5)
  })

  test('log: natural logarithm', () => {
    const a = array([1, Math.E, Math.E ** 2], { dtype: 'float64' })
    const result = log(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(1, 10)
    expect(result.getData().buffer[2]).toBeCloseTo(2, 10)
  })

  test('log10: base-10 logarithm', () => {
    const a = array([1, 10, 100, 1000], { dtype: 'float64' })
    const result = log10(a)
    expect(Array.from(result.getData().buffer)).toEqual([0, 1, 2, 3])
  })

  test('sin: sine function', () => {
    const a = array([0, Math.PI / 2, Math.PI], { dtype: 'float64' })
    const result = sin(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(1, 10)
    expect(result.getData().buffer[2]).toBeCloseTo(0, 10)
  })

  test('cos: cosine function', () => {
    const a = array([0, Math.PI / 2, Math.PI], { dtype: 'float64' })
    const result = cos(a)
    expect(result.getData().buffer[0]).toBeCloseTo(1, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[2]).toBeCloseTo(-1, 10)
  })

  test('tan: tangent function', () => {
    const a = array([0, Math.PI / 4], { dtype: 'float64' })
    const result = tan(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(1, 10)
  })

  test('arcsin: inverse sine', () => {
    const a = array([0, 0.5, 1], { dtype: 'float64' })
    const result = arcsin(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(Math.PI / 6, 10)
    expect(result.getData().buffer[2]).toBeCloseTo(Math.PI / 2, 10)
  })

  test('arccos: inverse cosine', () => {
    const a = array([1, 0.5, 0], { dtype: 'float64' })
    const result = arccos(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(Math.PI / 3, 10)
    expect(result.getData().buffer[2]).toBeCloseTo(Math.PI / 2, 10)
  })

  test('arctan: inverse tangent', () => {
    const a = array([0, 1], { dtype: 'float64' })
    const result = arctan(a)
    expect(result.getData().buffer[0]).toBeCloseTo(0, 10)
    expect(result.getData().buffer[1]).toBeCloseTo(Math.PI / 4, 10)
  })

  test('round: round to nearest integer', () => {
    const a = array([1.2, 1.5, 1.7, 2.5, -1.5], { dtype: 'float64' })
    const result = round(a)
    // Note: Rust f64::round() uses "round half away from zero" (banker's rounding)
    // Math.round uses "round half towards positive infinity"
    // -1.5 rounds to -2 in Rust, -1 in JS Math.round
    expect(Array.from(result.getData().buffer)).toEqual([1, 2, 2, 3, -2])
  })

  test('floor: round down', () => {
    const a = array([1.2, 1.9, -1.2, -1.9], { dtype: 'float64' })
    const result = floor(a)
    expect(Array.from(result.getData().buffer)).toEqual([1, 1, -2, -2])
  })

  test('ceil: round up', () => {
    const a = array([1.2, 1.9, -1.2, -1.9], { dtype: 'float64' })
    const result = ceil(a)
    expect(Array.from(result.getData().buffer)).toEqual([2, 2, -1, -1])
  })

  test('trunc: truncate towards zero', () => {
    const a = array([1.9, -1.9, 2.5, -2.5], { dtype: 'float64' })
    const result = trunc(a)
    expect(Array.from(result.getData().buffer)).toEqual([1, -1, 2, -2])
  })

  test('maximum: element-wise max of two arrays', () => {
    const a = array([1, 5, 3])
    const b = array([4, 2, 6])
    const result = maximum(a, b)
    expect(Array.from(result.getData().buffer)).toEqual([4, 5, 6])
  })

  test('minimum: element-wise min of two arrays', () => {
    const a = array([1, 5, 3])
    const b = array([4, 2, 6])
    const result = minimum(a, b)
    expect(Array.from(result.getData().buffer)).toEqual([1, 2, 3])
  })

  test('clip: clip values to range', () => {
    const a = array([-5, 0, 5, 10, 15])
    const result = clip(a, 0, 10)
    expect(Array.from(result.getData().buffer)).toEqual([0, 0, 5, 10, 10])
  })

  test('works with 2D arrays', () => {
    const a = array([
      [1, 4],
      [9, 16],
    ])
    const result = sqrt(a)
    expect(result.shape).toEqual([2, 2])
    expect(Array.from(result.getData().buffer)).toEqual([1, 2, 3, 4])
  })
})
