import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { fft, fftfreq, fftshift, ifftshift, rfftfreq } from './index'

describe('FFT Utility Functions', () => {
  describe('fftfreq', () => {
    test('fftfreq - basic usage', () => {
      const result = fftfreq(8, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([8])
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[1]).toBeCloseTo(0.125)
      expect(data.buffer[2]).toBeCloseTo(0.25)
      expect(data.buffer[3]).toBeCloseTo(0.375)
      expect(data.buffer[4]).toBeCloseTo(-0.5)
      expect(data.buffer[5]).toBeCloseTo(-0.375)
      expect(data.buffer[6]).toBeCloseTo(-0.25)
      expect(data.buffer[7]).toBeCloseTo(-0.125)
    })

    test('fftfreq - with custom spacing', () => {
      const result = fftfreq(8, 0.125)
      const data = result.getData()

      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[1]).toBeCloseTo(1.0)
      expect(data.buffer[2]).toBeCloseTo(2.0)
      expect(data.buffer[3]).toBeCloseTo(3.0)
      expect(data.buffer[4]).toBeCloseTo(-4.0)
      expect(data.buffer[5]).toBeCloseTo(-3.0)
    })

    test('fftfreq - power of 2', () => {
      const result = fftfreq(16, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([16])
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[8]).toBeCloseTo(-0.5)
    })

    test('fftfreq - odd length', () => {
      const result = fftfreq(7, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([7])
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[3]).toBeCloseTo(3 / 7)
      expect(data.buffer[4]).toBeCloseTo(-3 / 7)
    })
  })

  describe('rfftfreq', () => {
    test('rfftfreq - basic usage', () => {
      const result = rfftfreq(8, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([5]) // 8//2 + 1
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[1]).toBeCloseTo(0.125)
      expect(data.buffer[2]).toBeCloseTo(0.25)
      expect(data.buffer[3]).toBeCloseTo(0.375)
      expect(data.buffer[4]).toBeCloseTo(0.5)
    })

    test('rfftfreq - with custom spacing', () => {
      const result = rfftfreq(8, 0.125)
      const data = result.getData()

      expect(data.shape).toEqual([5])
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[1]).toBeCloseTo(1.0)
      expect(data.buffer[4]).toBeCloseTo(4.0)
    })

    test('rfftfreq - power of 2', () => {
      const result = rfftfreq(16, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([9]) // 16//2 + 1
      expect(data.buffer[0]).toBeCloseTo(0.0)
      expect(data.buffer[8]).toBeCloseTo(0.5)
    })

    test('rfftfreq - odd length', () => {
      const result = rfftfreq(7, 1.0)
      const data = result.getData()

      expect(data.shape).toEqual([4]) // 7//2 + 1
    })
  })

  describe('fftshift', () => {
    test('fftshift - 1D array even length', () => {
      const arr = array([0, 1, 2, 3, 4, 5, 6, 7])
      const result = fftshift(arr)
      const data = result.getData()

      expect(data.shape).toEqual([8])
      // Shift by 4: [4, 5, 6, 7, 0, 1, 2, 3]
      expect(Array.from(data.buffer)).toEqual([4, 5, 6, 7, 0, 1, 2, 3])
    })

    test('fftshift - 1D array odd length', () => {
      const arr = array([0, 1, 2, 3, 4, 5, 6])
      const result = fftshift(arr)
      const data = result.getData()

      expect(data.shape).toEqual([7])
      // Shift by 3: [4, 5, 6, 0, 1, 2, 3]
      expect(Array.from(data.buffer)).toEqual([4, 5, 6, 0, 1, 2, 3])
    })

    test('fftshift - 2D array', () => {
      const arr = array([
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
      ])
      const result = fftshift(arr)
      const data = result.getData()

      expect(data.shape).toEqual([4, 4])
      // Shifted both axes
      expect(data.buffer.length).toBe(16)
    })

    test('fftshift - specific axis', () => {
      const arr = array([
        [0, 1, 2, 3],
        [4, 5, 6, 7],
      ])
      const result = fftshift(arr, [1]) // Only shift columns
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      // Shift by 2 along axis 1: [[2, 3, 0, 1], [6, 7, 4, 5]]
      expect(Array.from(data.buffer)).toEqual([2, 3, 0, 1, 6, 7, 4, 5])
    })

    test('fftshift - with FFT output', () => {
      const signal = array([1, 2, 3, 4])
      const freq = fft(signal)
      const shifted = fftshift(freq)

      expect(shifted.getData().shape[0]).toBe(4)
    })

    test('fftshift - invalid axis error', () => {
      const arr = array([1, 2, 3, 4])
      expect(() => fftshift(arr, [5])).toThrow('out of bounds')
    })
  })

  describe('ifftshift', () => {
    test('ifftshift - inverse of fftshift (even)', () => {
      const arr = array([0, 1, 2, 3, 4, 5, 6, 7])
      const shifted = fftshift(arr)
      const back = ifftshift(shifted)
      const data = back.getData()

      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    test('ifftshift - inverse of fftshift (odd)', () => {
      const arr = array([0, 1, 2, 3, 4, 5, 6])
      const shifted = fftshift(arr)
      const back = ifftshift(shifted)
      const data = back.getData()

      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    test('ifftshift - 1D even length', () => {
      const arr = array([4, 5, 6, 7, 0, 1, 2, 3])
      const result = ifftshift(arr)
      const data = result.getData()

      // Shift by 4: [0, 1, 2, 3, 4, 5, 6, 7]
      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    test('ifftshift - 1D odd length', () => {
      const arr = array([4, 5, 6, 0, 1, 2, 3])
      const result = ifftshift(arr)
      const data = result.getData()

      // Shift by 4: [0, 1, 2, 3, 4, 5, 6]
      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    test('ifftshift - 2D array', () => {
      const arr = array([
        [0, 1],
        [2, 3],
      ])
      const shifted = fftshift(arr)
      const back = ifftshift(shifted)
      const data = back.getData()

      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3])
    })

    test('ifftshift - specific axis', () => {
      const arr = array([
        [2, 3, 0, 1],
        [6, 7, 4, 5],
      ])
      const result = ifftshift(arr, [1]) // Only shift columns back
      const data = result.getData()

      expect(data.shape).toEqual([2, 4])
      expect(Array.from(data.buffer)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    test('ifftshift - invalid axis error', () => {
      const arr = array([1, 2, 3, 4])
      expect(() => ifftshift(arr, [5])).toThrow('out of bounds')
    })
  })

  describe('Integration - FFT frequency analysis', () => {
    test('frequency analysis workflow', () => {
      // Create signal with known frequency
      const n = 8
      const signal = array([1, 2, 3, 4, 4, 3, 2, 1])

      // Get FFT
      const freq = fft(signal)
      expect(freq.getData().shape).toEqual([8, 2])

      // Get frequencies
      const frequencies = fftfreq(n, 1.0)
      expect(frequencies.getData().shape).toEqual([8])

      // Shift to center
      const centered = fftshift(freq)
      expect(centered.getData().shape[0]).toBe(8)

      // Shift back
      const original = ifftshift(centered)
      expect(original.getData().shape[0]).toBe(8)
    })
  })
})
