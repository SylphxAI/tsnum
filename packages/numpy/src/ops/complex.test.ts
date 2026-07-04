import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { fft } from '../fft'
import { angle, conj, conjugate, imag, real } from './complex'

describe('Complex Number Functions', () => {
  describe('real', () => {
    test('real - real input returns copy', () => {
      const arr = array([1, 2, 3, 4])
      const result = real(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4])
    })

    test('real - complex input extracts real part', () => {
      // FFT output has [real, imag] pairs
      const signal = array([1, 2, 3, 4])
      const freq = fft(signal)
      const realPart = real(freq)
      const data = realPart.getData()

      expect(data.shape).toEqual([4]) // Extracted from [4, 2] shape
      expect(data.buffer.length).toBe(4)
    })

    test('real - 2D complex array', () => {
      const arr = array([
        [1, 2],
        [3, 4],
        [5, 6],
      ]) // Shape [3, 2] - treated as 3 complex numbers
      const result = real(arr)
      const data = result.getData()

      expect(data.shape).toEqual([3])
      expect(Array.from(data.buffer)).toEqual([1, 3, 5])
    })

    test('real - 2D real array', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
      ])
      const result = real(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('imag', () => {
    test('imag - real input returns zeros', () => {
      const arr = array([1, 2, 3, 4])
      const result = imag(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4])
      expect(Array.from(data.buffer)).toEqual([0, 0, 0, 0])
    })

    test('imag - complex input extracts imaginary part', () => {
      const signal = array([1, 2, 3, 4])
      const freq = fft(signal)
      const imagPart = imag(freq)
      const data = imagPart.getData()

      expect(data.shape).toEqual([4])
      expect(data.buffer.length).toBe(4)
    })

    test('imag - 2D complex array', () => {
      const arr = array([
        [1, 2],
        [3, 4],
        [5, 6],
      ]) // Complex: 1+2i, 3+4i, 5+6i
      const result = imag(arr)
      const data = result.getData()

      expect(data.shape).toEqual([3])
      expect(Array.from(data.buffer)).toEqual([2, 4, 6])
    })

    test('imag - 2D real array', () => {
      const arr = array([
        [1, 2, 3],
        [4, 5, 6],
      ])
      const result = imag(arr)
      const data = result.getData()

      expect(data.shape).toEqual([2, 3])
      expect(Array.from(data.buffer)).toEqual([0, 0, 0, 0, 0, 0])
    })
  })

  describe('angle', () => {
    test('angle - real positive input', () => {
      const arr = array([1, 2, 3])
      const result = angle(arr)
      const data = result.getData()

      expect(data.shape).toEqual([3])
      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(0)
      expect(data.buffer[2]).toBeCloseTo(0)
    })

    test('angle - real negative input', () => {
      const arr = array([-1, -2, -3])
      const result = angle(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(Math.PI)
      expect(data.buffer[1]).toBeCloseTo(Math.PI)
      expect(data.buffer[2]).toBeCloseTo(Math.PI)
    })

    test('angle - complex input (radians)', () => {
      const arr = array([
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) // 1+i, 1-i, -1+i, -1-i
      const result = angle(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4])
      expect(data.buffer[0]).toBeCloseTo(Math.PI / 4) // 45°
      expect(data.buffer[1]).toBeCloseTo(-Math.PI / 4) // -45°
      expect(data.buffer[2]).toBeCloseTo((3 * Math.PI) / 4) // 135°
      expect(data.buffer[3]).toBeCloseTo((-3 * Math.PI) / 4) // -135°
    })

    test('angle - complex input (degrees)', () => {
      const arr = array([
        [1, 1],
        [1, -1],
      ])
      const result = angle(arr, true)
      const data = result.getData()

      expect(data.shape).toEqual([2])
      expect(data.buffer[0]).toBeCloseTo(45)
      expect(data.buffer[1]).toBeCloseTo(-45)
    })

    test('angle - real input (degrees)', () => {
      const arr = array([-1, 0, 1])
      const result = angle(arr, true)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(180)
      expect(data.buffer[1]).toBeCloseTo(0)
      expect(data.buffer[2]).toBeCloseTo(0)
    })

    test('angle - zero', () => {
      const arr = array([[0, 0]])
      const result = angle(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
    })
  })

  describe('conj', () => {
    test('conj - real input unchanged', () => {
      const arr = array([1, 2, 3, 4])
      const result = conj(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4])
      expect(Array.from(data.buffer)).toEqual([1, 2, 3, 4])
    })

    test('conj - complex input negates imaginary', () => {
      const arr = array([
        [1, 2],
        [3, -4],
        [-5, 6],
        [-7, -8],
      ]) // 1+2i, 3-4i, -5+6i, -7-8i
      const result = conj(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4, 2])
      expect(data.buffer[0]).toBeCloseTo(1)
      expect(data.buffer[1]).toBeCloseTo(-2) // Conjugate: 1-2i
      expect(data.buffer[2]).toBeCloseTo(3)
      expect(data.buffer[3]).toBeCloseTo(4) // Conjugate: 3+4i
      expect(data.buffer[4]).toBeCloseTo(-5)
      expect(data.buffer[5]).toBeCloseTo(-6) // Conjugate: -5-6i
      expect(data.buffer[6]).toBeCloseTo(-7)
      expect(data.buffer[7]).toBeCloseTo(8) // Conjugate: -7+8i
    })

    test('conj - FFT output', () => {
      const signal = array([1, 2, 3, 4])
      const freq = fft(signal)
      const conjugated = conj(freq)

      expect(conjugated.getData().shape).toEqual([4, 2])
    })

    test('conj - zero', () => {
      const arr = array([[0, 0]])
      const result = conj(arr)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0)
      expect(data.buffer[1]).toBeCloseTo(0)
    })
  })

  describe('conjugate', () => {
    test('conjugate - alias for conj', () => {
      const arr = array([
        [1, 2],
        [3, 4],
      ])
      const result1 = conj(arr)
      const result2 = conjugate(arr)

      expect(Array.from(result1.getData().buffer)).toEqual(Array.from(result2.getData().buffer))
    })
  })

  describe('Integration', () => {
    test('complex workflow with FFT', () => {
      const signal = array([1, 2, 3, 4])

      // Get FFT
      const freq = fft(signal)

      // Extract real and imaginary parts
      const realPart = real(freq)
      const imagPart = imag(freq)

      expect(realPart.getData().shape).toEqual([4])
      expect(imagPart.getData().shape).toEqual([4])

      // Get magnitude and phase
      const phase = angle(freq)
      expect(phase.getData().shape).toEqual([4])

      // Get conjugate
      const freqConj = conj(freq)
      expect(freqConj.getData().shape).toEqual([4, 2])
    })

    test('real and imag reconstruction', () => {
      const arr = array([
        [3, 4],
        [5, 12],
      ]) // 3+4i, 5+12i

      const re = real(arr)
      const im = imag(arr)

      expect(Array.from(re.getData().buffer)).toEqual([3, 5])
      expect(Array.from(im.getData().buffer)).toEqual([4, 12])
    })
  })
})
