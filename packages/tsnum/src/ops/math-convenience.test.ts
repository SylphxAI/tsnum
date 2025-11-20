import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import {
  cbrt,
  deg2rad,
  divmod,
  gcd,
  heaviside,
  hypot,
  lcm,
  rad2deg,
  reciprocal,
  sinc,
  square,
} from './math-convenience'

describe('Math Convenience Functions', () => {
  describe('deg2rad', () => {
    test('deg2rad - basic conversion', () => {
      const arr = array([0, 90, 180, 270, 360])
      const result = deg2rad(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(Math.PI / 2)
      expect(data.buffer[2]).toBeCloseTo(Math.PI)
      expect(data.buffer[3]).toBeCloseTo(3 * Math.PI / 2)
      expect(data.buffer[4]).toBeCloseTo(2 * Math.PI)
    })

    test('deg2rad - negative angles', () => {
      const arr = array([-90, -180])
      const result = deg2rad(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(-Math.PI / 2)
      expect(data.buffer[1]).toBeCloseTo(-Math.PI)
    })
  })

  describe('rad2deg', () => {
    test('rad2deg - basic conversion', () => {
      const arr = array([0, Math.PI / 2, Math.PI, 2 * Math.PI], { dtype: 'float64' })
      const result = rad2deg(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(90)
      expect(data.buffer[2]).toBeCloseTo(180)
      expect(data.buffer[3]).toBeCloseTo(360)
    })

    test('rad2deg - round trip', () => {
      const arr = array([45, 60, 120])
      const rad = deg2rad(arr)
      const deg = rad2deg(rad)
      const data = deg.getData()

      expect(data.buffer[0]).toBeCloseTo(45)
      expect(data.buffer[1]).toBeCloseTo(60)
      expect(data.buffer[2]).toBeCloseTo(120)
    })
  })

  describe('hypot', () => {
    test('hypot - 3-4-5 triangle', () => {
      const a = array([3, 4, 5])
      const b = array([4, 3, 12])
      const result = hypot(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(5) // sqrt(3^2 + 4^2)
      expect(data.buffer[1]).toBeCloseTo(5) // sqrt(4^2 + 3^2)
      expect(data.buffer[2]).toBeCloseTo(13) // sqrt(5^2 + 12^2)
    })

    test('hypot - zero values', () => {
      const a = array([0, 5, 0])
      const b = array([5, 0, 0])
      const result = hypot(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(5)
      expect(data.buffer[1]).toBeCloseTo(5)
      expect(data.buffer[2]).toBeCloseTo(0)
    })

    test('hypot - shape mismatch error', () => {
      const a = array([1, 2, 3])
      const b = array([1, 2])
      expect(() => hypot(a, b)).toThrow('same size')
    })
  })

  describe('sinc', () => {
    test('sinc - at zero', () => {
      const arr = array([0])
      const result = sinc(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(1)
    })

    test('sinc - at integer multiples', () => {
      const arr = array([1, 2, 3])
      const result = sinc(arr)
      const data = result.getData()

      expect(Math.abs(data.buffer[0])).toBeLessThan(1e-10) // sin(π)/π ≈ 0
      expect(Math.abs(data.buffer[1])).toBeLessThan(1e-10) // sin(2π)/(2π) ≈ 0
      expect(Math.abs(data.buffer[2])).toBeLessThan(1e-10) // sin(3π)/(3π) ≈ 0
    })

    test('sinc - at 0.5', () => {
      const arr = array([0.5])
      const result = sinc(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(2 / Math.PI, 5)
    })

    test('sinc - negative values', () => {
      const arr = array([-1, -2])
      const result = sinc(arr)
      const data = result.getData()

      expect(Math.abs(data.buffer[0])).toBeLessThan(1e-10)
      expect(Math.abs(data.buffer[1])).toBeLessThan(1e-10)
    })
  })

  describe('cbrt', () => {
    test('cbrt - perfect cubes', () => {
      const arr = array([8, 27, 64, 125])
      const result = cbrt(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(2)
      expect(data.buffer[1]).toBeCloseTo(3)
      expect(data.buffer[2]).toBeCloseTo(4)
      expect(data.buffer[3]).toBeCloseTo(5)
    })

    test('cbrt - negative values', () => {
      const arr = array([-8, -27])
      const result = cbrt(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(-2)
      expect(data.buffer[1]).toBeCloseTo(-3)
    })

    test('cbrt - zero', () => {
      const arr = array([0])
      const result = cbrt(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
    })
  })

  describe('square', () => {
    test('square - positive values', () => {
      const arr = array([1, 2, 3, 4])
      const result = square(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([1, 4, 9, 16])
    })

    test('square - negative values', () => {
      const arr = array([-2, -3])
      const result = square(arr)
      const data = result.getData()

      expect(Array.from(data.buffer)).toEqual([4, 9])
    })

    test('square - zero', () => {
      const arr = array([0])
      const result = square(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBe(0)
    })
  })

  describe('reciprocal', () => {
    test('reciprocal - basic', () => {
      const arr = array([1, 2, 4, 8])
      const result = reciprocal(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(1)
      expect(data.buffer[1]).toBeCloseTo(0.5)
      expect(data.buffer[2]).toBeCloseTo(0.25)
      expect(data.buffer[3]).toBeCloseTo(0.125)
    })

    test('reciprocal - negative values', () => {
      const arr = array([-2, -4])
      const result = reciprocal(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(-0.5)
      expect(data.buffer[1]).toBeCloseTo(-0.25)
    })

    test('reciprocal - large values', () => {
      const arr = array([1000])
      const result = reciprocal(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0.001)
    })
  })

  describe('gcd', () => {
    test('gcd - basic', () => {
      const a = array([12, 15, 18])
      const b = array([8, 10, 24])
      const result = gcd(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(4)
      expect(data.buffer[1]).toBe(5)
      expect(data.buffer[2]).toBe(6)
    })

    test('gcd - coprime numbers', () => {
      const a = array([7, 11])
      const b = array([3, 13])
      const result = gcd(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(1)
      expect(data.buffer[1]).toBe(1)
    })

    test('gcd - with zero', () => {
      const a = array([0, 5])
      const b = array([5, 0])
      const result = gcd(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(5)
      expect(data.buffer[1]).toBe(5)
    })

    test('gcd - negative values', () => {
      const a = array([-12, -15])
      const b = array([8, -10])
      const result = gcd(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(4)
      expect(data.buffer[1]).toBe(5)
    })

    test('gcd - shape mismatch error', () => {
      const a = array([1, 2, 3])
      const b = array([1, 2])
      expect(() => gcd(a, b)).toThrow('same size')
    })
  })

  describe('lcm', () => {
    test('lcm - basic', () => {
      const a = array([4, 6, 8])
      const b = array([6, 9, 12])
      const result = lcm(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(12)
      expect(data.buffer[1]).toBe(18)
      expect(data.buffer[2]).toBe(24)
    })

    test('lcm - coprime numbers', () => {
      const a = array([7, 11])
      const b = array([3, 13])
      const result = lcm(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(21)
      expect(data.buffer[1]).toBe(143)
    })

    test('lcm - with one', () => {
      const a = array([1, 1])
      const b = array([5, 10])
      const result = lcm(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(5)
      expect(data.buffer[1]).toBe(10)
    })

    test('lcm - negative values', () => {
      const a = array([-4, -6])
      const b = array([6, -9])
      const result = lcm(a, b)
      const data = result.getData()

      expect(data.buffer[0]).toBe(12)
      expect(data.buffer[1]).toBe(18)
    })

    test('lcm - shape mismatch error', () => {
      const a = array([1, 2, 3])
      const b = array([1, 2])
      expect(() => lcm(a, b)).toThrow('same size')
    })
  })

  describe('heaviside', () => {
    test('heaviside - default h0', () => {
      const arr = array([-1, 0, 1])
      const result = heaviside(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBe(0)
      expect(data.buffer[1]).toBe(0.5) // default h0
      expect(data.buffer[2]).toBe(1)
    })

    test('heaviside - custom h0', () => {
      const arr = array([-2, 0, 2])
      const result = heaviside(arr, 0)
      const data = result.getData()

      expect(data.buffer[0]).toBe(0)
      expect(data.buffer[1]).toBe(0) // custom h0
      expect(data.buffer[2]).toBe(1)
    })

    test('heaviside - h0 = 1', () => {
      const arr = array([0, 0, 0])
      const result = heaviside(arr, 1)
      const data = result.getData()

      expect(data.buffer[0]).toBe(1)
      expect(data.buffer[1]).toBe(1)
      expect(data.buffer[2]).toBe(1)
    })

    test('heaviside - mixed values', () => {
      const arr = array([-5, -0.1, 0, 0.1, 5], { dtype: 'float64' })
      const result = heaviside(arr, 0.7)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(0)
      expect(data.buffer[2]).toBeCloseTo(0.7)
      expect(data.buffer[3]).toBeCloseTo(1)
      expect(data.buffer[4]).toBeCloseTo(1)
    })
  })

  describe('divmod', () => {
    test('divmod - basic', () => {
      const a = array([10, 11, 12])
      const b = array([3, 3, 3])
      const result = divmod(a, b)

      expect(Array.from(result.quotient.getData().buffer)).toEqual([3, 3, 4])
      expect(Array.from(result.remainder.getData().buffer)).toEqual([1, 2, 0])
    })

    test('divmod - exact division', () => {
      const a = array([6, 12, 18])
      const b = array([3, 3, 3])
      const result = divmod(a, b)

      expect(Array.from(result.quotient.getData().buffer)).toEqual([2, 4, 6])
      expect(Array.from(result.remainder.getData().buffer)).toEqual([0, 0, 0])
    })

    test('divmod - negative dividends', () => {
      const a = array([-10, -11], { dtype: 'float64' })
      const b = array([3, 3], { dtype: 'float64' })
      const result = divmod(a, b)

      expect(result.quotient.getData().buffer[0]).toBeCloseTo(-4)
      expect(result.remainder.getData().buffer[0]).toBeCloseTo(2)
    })

    test('divmod - different divisors', () => {
      const a = array([17, 17, 17])
      const b = array([5, 3, 2])
      const result = divmod(a, b)

      expect(Array.from(result.quotient.getData().buffer)).toEqual([3, 5, 8])
      expect(Array.from(result.remainder.getData().buffer)).toEqual([2, 2, 1])
    })

    test('divmod - shape mismatch error', () => {
      const a = array([1, 2, 3])
      const b = array([1, 2])
      expect(() => divmod(a, b)).toThrow('same size')
    })
  })
})
