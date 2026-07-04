import { expect, test } from 'bun:test'
import {
  addF64,
  addF64Buffer,
  addF64Buffers,
  addScalarF64,
  addScalarF64Buffer,
  addScalarF64Buffers,
  mulScalarF64,
  mulScalarF64Buffer,
  mulScalarF64Buffers,
  transposeF64Buffer,
} from '../index.js'

test('native float64 scalar and vector kernels match NumPy-style outputs', () => {
  const a = new Float64Array([1, 2, 3])
  const b = new Float64Array([4, 5, 6])

  expect(Array.from(addScalarF64(a, 10))).toEqual([11, 12, 13])
  expect(Array.from(mulScalarF64(a, 2))).toEqual([2, 4, 6])
  expect(Array.from(addF64(a, b))).toEqual([5, 7, 9])
})

function bytes(array: Float64Array): Buffer {
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength)
}

test('native buffer kernels fill caller-owned output buffers', () => {
  const a = new Float64Array([1, 2, 3])
  const b = new Float64Array([4, 5, 6])
  const output = new Float64Array(3)

  addScalarF64Buffer(a, 10, bytes(output))
  expect(Array.from(output)).toEqual([11, 12, 13])

  mulScalarF64Buffer(a, 2, bytes(output))
  expect(Array.from(output)).toEqual([2, 4, 6])

  addF64Buffer(a, b, bytes(output))
  expect(Array.from(output)).toEqual([5, 7, 9])
})

test('native all-buffer kernels fill caller-owned output buffers', () => {
  const a = new Float64Array([1, 2, 3])
  const b = new Float64Array([4, 5, 6])
  const output = new Float64Array(3)

  addScalarF64Buffers(bytes(a), 10, bytes(output))
  expect(Array.from(output)).toEqual([11, 12, 13])

  mulScalarF64Buffers(bytes(a), 2, bytes(output))
  expect(Array.from(output)).toEqual([2, 4, 6])

  addF64Buffers(bytes(a), bytes(b), bytes(output))
  expect(Array.from(output)).toEqual([5, 7, 9])
})

test('native add rejects mismatched lengths', () => {
  expect(() => addF64(new Float64Array([1]), new Float64Array([1, 2]))).toThrow(
    'Expected equal input lengths',
  )
})

test('native buffer kernels reject mismatched output lengths', () => {
  expect(() =>
    addScalarF64Buffer(new Float64Array([1, 2]), 10, bytes(new Float64Array(1))),
  ).toThrow('Expected output byte length')
})

test('native transpose buffer kernel matches row-major NumPy output', () => {
  const input = new Float64Array([1, 2, 3, 4, 5, 6])
  const output = new Float64Array(6)

  transposeF64Buffer(input, 2, 3, bytes(output))

  expect(Array.from(output)).toEqual([1, 4, 2, 5, 3, 6])
})

test('native transpose buffer kernel rejects invalid dimensions', () => {
  const input = new Float64Array([1, 2, 3])
  const output = new Float64Array(3)

  expect(() => transposeF64Buffer(input, 2, 2, bytes(output))).toThrow('Expected input length')
})
