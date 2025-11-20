import { describe, expect, test } from 'bun:test'
import { array } from '../creation'
import { fft, fftn, ifft, ifftn, irfft, irfftn, rfft, rfftn } from './index'

describe('N-Dimensional FFT', () => {
  test('fftn - 2D array', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
    const result = fftn(arr)
    const data = result.getData()

    expect(data.shape).toEqual([4, 4, 2]) // [rows, cols, [real, imag]]
    expect(data.dtype).toBe('float64')

    // DC component (sum of all elements)
    expect(data.buffer[0]).toBeCloseTo(136) // sum = 1+2+...+16 = 136
    expect(data.buffer[1]).toBeCloseTo(0) // imaginary part should be 0
  })

  test('fftn - 3D array', () => {
    const arr = array([
      [[1, 2], [3, 4]],
      [[5, 6], [7, 8]]
    ])
    const result = fftn(arr)
    const data = result.getData()

    expect(data.shape).toEqual([2, 2, 2, 2]) // [depth, rows, cols, [real, imag]]
    expect(data.dtype).toBe('float64')

    // DC component
    expect(data.buffer[0]).toBeCloseTo(36) // sum = 1+2+...+8 = 36
  })

  test('fftn with specific axes', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
    const result = fftn(arr, undefined, [0]) // Only transform along axis 0
    const data = result.getData()

    expect(data.shape).toEqual([4, 4, 2])
  })

  test('ifftn - inverse of fftn', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
    const forward = fftn(arr)
    const backward = ifftn(forward)
    const data = backward.getData()

    // Check real part matches original (within floating point tolerance)
    const original = arr.getData()
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const idx = (i * 4 + j) * 2 // [real, imag] pairs
        expect(data.buffer[idx]).toBeCloseTo(original.buffer[i * 4 + j], 5)
        expect(Math.abs(data.buffer[idx + 1])).toBeLessThan(1e-10) // imaginary ~0
      }
    }
  })

  test('rfftn - real FFT on 2D array', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
    const result = rfftn(arr)
    const data = result.getData()

    // Real FFT returns n/2 + 1 frequencies along last axis
    expect(data.shape).toEqual([4, 3, 2]) // [4, 4/2+1, 2]
    expect(data.dtype).toBe('float64')

    // DC component
    expect(data.buffer[0]).toBeCloseTo(136)
  })

  test('irfftn - inverse of rfftn', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
    const forward = rfftn(arr)
    const backward = irfftn(forward)
    const data = backward.getData()

    // Check reconstruction
    const original = arr.getData()
    expect(data.shape).toEqual(original.shape)
    for (let i = 0; i < data.buffer.length; i++) {
      expect(data.buffer[i]).toBeCloseTo(original.buffer[i], 5)
    }
  })

  test('fftn - power of 2 requirement', () => {
    const arr = array([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) // 3x3 not power of 2
    expect(() => fftn(arr)).toThrow('power of 2')
  })

  test('fftn - empty array', () => {
    const arr = array([[]])
    expect(() => fftn(arr)).toThrow()
  })

  test('rfftn with single axis', () => {
    const arr = array([[1, 2, 3, 4], [5, 6, 7, 8]])
    const result = rfftn(arr, undefined, [1]) // Only last axis
    const data = result.getData()

    expect(data.shape[1]).toBe(3) // 4/2 + 1
  })
})

describe('1D/2D FFT backward compatibility', () => {
  test('fft - 1D still works', () => {
    const arr = array([1, 2, 3, 4])
    const result = fft(arr)
    const data = result.getData()

    expect(data.shape).toEqual([4, 2])
    expect(data.buffer[0]).toBeCloseTo(10) // DC component
  })

  test('rfft - 1D still works', () => {
    const arr = array([1, 2, 3, 4])
    const result = rfft(arr)
    const data = result.getData()

    expect(data.shape).toEqual([3, 2]) // 4/2 + 1
  })

  test('ifft - 1D still works', () => {
    const arr = array([1, 2, 3, 4])
    const forward = fft(arr)
    const backward = ifft(forward)
    const data = backward.getData()

    for (let i = 0; i < 4; i++) {
      expect(data.buffer[i * 2]).toBeCloseTo(arr.getData().buffer[i], 5)
    }
  })

  test('irfft - 1D still works', () => {
    const arr = array([1, 2, 3, 4])
    const forward = rfft(arr)
    const backward = irfft(forward)
    const data = backward.getData()

    expect(data.shape).toEqual([4])
    for (let i = 0; i < 4; i++) {
      expect(data.buffer[i]).toBeCloseTo(arr.getData().buffer[i], 5)
    }
  })
})
