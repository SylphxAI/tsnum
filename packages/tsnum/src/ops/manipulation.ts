// ===== Array Manipulation =====
// Concatenation, stacking, splitting

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

/**
 * Concatenate arrays along an axis
 */
export function concat<T extends DType>(arrays: NDArray<T>[], axis = 0): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to concatenate')
  }

  const firstData = arrays[0].getData()
  const dtype = firstData.dtype

  // For 1D arrays or axis=0
  if (firstData.shape.length === 1 || axis === 0) {
    // Calculate total length
    let totalLength = 0
    for (const arr of arrays) {
      totalLength += arr.getData().buffer.length
    }

    // Create new buffer and copy data
    const newBuffer = createTypedArray(totalLength, dtype)
    let offset = 0

    for (const arr of arrays) {
      const data = arr.getData()
      for (let i = 0; i < data.buffer.length; i++) {
        newBuffer[offset + i] = data.buffer[i]
      }
      offset += data.buffer.length
    }

    // Calculate new shape
    if (firstData.shape.length === 1) {
      return new NDArray({
        buffer: newBuffer,
        shape: [totalLength],
        strides: [1],
        dtype,
      })
    }

    // For 2D concatenation along axis 0
    const cols = firstData.shape[1]
    const rows = totalLength / cols

    return new NDArray({
      buffer: newBuffer,
      shape: [rows, cols],
      strides: [cols, 1],
      dtype,
    })
  }

  throw new Error('concat only supports axis=0 for now')
}

/**
 * Stack arrays vertically (row-wise)
 */
export function vstack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  return concat(arrays, 0)
}

/**
 * Stack arrays horizontally (column-wise)
 */
export function hstack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to stack')
  }

  const firstData = arrays[0].getData()

  // For 1D arrays, just concatenate
  if (firstData.shape.length === 1) {
    return concat(arrays, 0)
  }

  throw new Error('hstack for 2D arrays not yet implemented')
}

/**
 * Stack arrays along a new axis
 */
export function stack<T extends DType>(arrays: NDArray<T>[], axis = 0): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('Need at least one array to stack')
  }

  if (axis !== 0) {
    throw new Error('stack only supports axis=0 for now')
  }

  const firstData = arrays[0].getData()
  const dtype = firstData.dtype
  const elementsPerArray = firstData.buffer.length

  // All arrays must have same shape
  for (const arr of arrays) {
    if (arr.getData().buffer.length !== elementsPerArray) {
      throw new Error('All arrays must have the same shape for stack')
    }
  }

  // Create new buffer
  const totalLength = arrays.length * elementsPerArray
  const newBuffer = createTypedArray(totalLength, dtype)

  // Copy data
  let offset = 0
  for (const arr of arrays) {
    const data = arr.getData()
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[offset + i] = data.buffer[i]
    }
    offset += data.buffer.length
  }

  // New shape: [num_arrays, ...original_shape]
  const newShape = [arrays.length, ...firstData.shape]
  const newStrides = new Array(newShape.length)
  newStrides[newShape.length - 1] = 1
  for (let i = newShape.length - 2; i >= 0; i--) {
    newStrides[i] = newStrides[i + 1] * newShape[i + 1]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: newShape,
    strides: newStrides,
    dtype,
  })
}

/**
 * Repeat elements of an array
 */
export function repeat<T extends DType>(a: NDArray<T>, repeats: number): NDArray<T> {
  const data = a.getData()
  const newLength = data.buffer.length * repeats
  const newBuffer = createTypedArray(newLength, data.dtype)

  let offset = 0
  for (let r = 0; r < repeats; r++) {
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[offset++] = data.buffer[i]
    }
  }

  const newShape =
    data.shape.length === 1 ? [newLength] : [data.shape[0] * repeats, ...data.shape.slice(1)]

  const newStrides = new Array(newShape.length)
  newStrides[newShape.length - 1] = 1
  for (let i = newShape.length - 2; i >= 0; i--) {
    newStrides[i] = newStrides[i + 1] * newShape[i + 1]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: newShape,
    strides: newStrides,
    dtype: data.dtype,
  })
}

/**
 * Split an array into multiple sub-arrays
 */
export function split<T extends DType>(
  a: NDArray<T>,
  indicesOrSections: number | number[],
): NDArray<T>[] {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('split only supports 1D arrays for now')
  }

  const n = data.buffer.length
  let splitPoints: number[]

  if (typeof indicesOrSections === 'number') {
    // Split into N equal parts
    const sections = indicesOrSections
    if (n % sections !== 0) {
      throw new Error(`Array of length ${n} cannot be split into ${sections} equal sections`)
    }

    const sectionSize = n / sections
    splitPoints = Array.from({ length: sections - 1 }, (_, i) => (i + 1) * sectionSize)
  } else {
    // Split at given indices
    splitPoints = indicesOrSections
  }

  // Add start and end points
  const points = [0, ...splitPoints, n]
  const results: NDArray<T>[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const length = end - start

    const buffer = createTypedArray(length, data.dtype)
    for (let j = 0; j < length; j++) {
      buffer[j] = data.buffer[start + j]
    }

    results.push(
      new NDArray({
        buffer,
        shape: [length],
        strides: [1],
        dtype: data.dtype,
      }),
    )
  }

  return results
}

/**
 * Split array horizontally (column-wise)
 */
export function hsplit<T extends DType>(
  a: NDArray<T>,
  indicesOrSections: number | number[],
): NDArray<T>[] {
  const data = a.getData()

  if (data.shape.length === 1) {
    return split(a, indicesOrSections)
  }

  throw new Error('hsplit for 2D arrays not yet implemented')
}

/**
 * Split array vertically (row-wise)
 */
export function vsplit<T extends DType>(
  a: NDArray<T>,
  indicesOrSections: number | number[],
): NDArray<T>[] {
  const data = a.getData()

  if (data.shape.length < 2) {
    throw new Error('vsplit requires at least 2D array')
  }

  throw new Error('vsplit not yet implemented')
}

/**
 * Repeat array by tiling
 */
export function tile<T extends DType>(a: NDArray<T>, reps: number | number[]): NDArray<T> {
  const data = a.getData()
  const repArray = typeof reps === 'number' ? [reps] : reps

  if (data.shape.length !== 1) {
    throw new Error('tile only supports 1D arrays for now')
  }

  if (repArray.length !== 1) {
    throw new Error('tile only supports 1D reps for now')
  }

  const numReps = repArray[0]
  const newLength = data.buffer.length * numReps
  const newBuffer = createTypedArray(newLength, data.dtype)

  for (let r = 0; r < numReps; r++) {
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[r * data.buffer.length + i] = data.buffer[i]
    }
  }

  return new NDArray({
    buffer: newBuffer,
    shape: [newLength],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Reverse the order of elements along given axis
 */
export function flip<T extends DType>(a: NDArray<T>, axis?: number): NDArray<T> {
  const data = a.getData()

  if (data.shape.length === 1) {
    // 1D flip
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[i] = data.buffer[data.buffer.length - 1 - i]
    }

    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  if (data.shape.length === 2) {
    const [rows, cols] = data.shape
    const flipAxis = axis ?? 0

    if (flipAxis < 0 || flipAxis >= 2) {
      throw new Error(`axis ${axis} out of bounds for 2D array`)
    }

    const newBuffer = createTypedArray(data.buffer.length, data.dtype)

    if (flipAxis === 0) {
      // Flip rows
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          newBuffer[i * cols + j] = data.buffer[(rows - 1 - i) * cols + j]
        }
      }
    } else {
      // Flip columns
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          newBuffer[i * cols + j] = data.buffer[i * cols + (cols - 1 - j)]
        }
      }
    }

    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  throw new Error('flip only supports 1D and 2D arrays')
}

/**
 * Rotate array by 90 degrees in the plane
 */
export function rot90<T extends DType>(a: NDArray<T>, k = 1): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('rot90 only supports 2D arrays')
  }

  const [rows, cols] = data.shape

  // Normalize k to [0, 3]
  const normalizedK = ((k % 4) + 4) % 4

  if (normalizedK === 0) {
    // No rotation
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[i] = data.buffer[i]
    }
    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  if (normalizedK === 1) {
    // 90 degrees counter-clockwise
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newBuffer[(cols - 1 - j) * rows + i] = data.buffer[i * cols + j]
      }
    }
    return new NDArray({
      buffer: newBuffer,
      shape: [cols, rows],
      strides: [rows, 1],
      dtype: data.dtype,
    })
  }

  if (normalizedK === 2) {
    // 180 degrees
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[i] = data.buffer[data.buffer.length - 1 - i]
    }
    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  // k === 3: 270 degrees counter-clockwise (90 clockwise)
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      newBuffer[j * rows + (rows - 1 - i)] = data.buffer[i * cols + j]
    }
  }
  return new NDArray({
    buffer: newBuffer,
    shape: [cols, rows],
    strides: [rows, 1],
    dtype: data.dtype,
  })
}

/**
 * Pad array with values
 */
export function pad<T extends DType>(
  a: NDArray<T>,
  padWidth: number | [number, number],
  mode: 'constant' | 'edge' = 'constant',
  constantValue = 0,
): NDArray<T> {
  const data = a.getData()

  if (data.shape.length === 1) {
    const n = data.buffer.length
    const [padBefore, padAfter] =
      typeof padWidth === 'number' ? [padWidth, padWidth] : padWidth

    const newLength = n + padBefore + padAfter
    const newBuffer = createTypedArray(newLength, data.dtype)

    if (mode === 'constant') {
      // Fill padding with constant
      for (let i = 0; i < padBefore; i++) {
        newBuffer[i] = constantValue
      }
      for (let i = 0; i < n; i++) {
        newBuffer[padBefore + i] = data.buffer[i]
      }
      for (let i = 0; i < padAfter; i++) {
        newBuffer[padBefore + n + i] = constantValue
      }
    } else {
      // Edge mode: repeat edge values
      for (let i = 0; i < padBefore; i++) {
        newBuffer[i] = data.buffer[0]
      }
      for (let i = 0; i < n; i++) {
        newBuffer[padBefore + i] = data.buffer[i]
      }
      for (let i = 0; i < padAfter; i++) {
        newBuffer[padBefore + n + i] = data.buffer[n - 1]
      }
    }

    return new NDArray({
      buffer: newBuffer,
      shape: [newLength],
      strides: [1],
      dtype: data.dtype,
    })
  }

  throw new Error('pad only supports 1D arrays for now')
}

/**
 * Move axis to new position
 */
export function moveaxis<T extends DType>(a: NDArray<T>, source: number, destination: number): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 2) {
    throw new Error('moveaxis only supports 2D arrays for now')
  }

  // For 2D, moveaxis is same as transpose when source != destination
  if (source === destination) {
    const newBuffer = createTypedArray(data.buffer.length, data.dtype)
    for (let i = 0; i < data.buffer.length; i++) {
      newBuffer[i] = data.buffer[i]
    }
    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  // Transpose
  const [rows, cols] = data.shape
  const newBuffer = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      newBuffer[j * rows + i] = data.buffer[i * cols + j]
    }
  }

  return new NDArray({
    buffer: newBuffer,
    shape: [cols, rows],
    strides: [rows, 1],
    dtype: data.dtype,
  })
}

/**
 * Delete elements from array along axis
 */
export function deleteArr<T extends DType>(
  arr: NDArray<T>,
  indices: number | number[],
  axis?: number,
): NDArray<T> {
  const data = arr.getData()

  if (axis !== undefined && axis !== 0) {
    throw new Error('delete only supports axis=0 or no axis')
  }

  const indicesArray = Array.isArray(indices) ? indices : [indices]

  if (axis === undefined) {
    // Flatten and delete
    const deleteSet = new Set(
      indicesArray.map((idx) => (idx < 0 ? data.buffer.length + idx : idx)),
    )

    const newLength = data.buffer.length - deleteSet.size
    const result = createTypedArray(newLength, data.dtype)
    let destIdx = 0

    for (let i = 0; i < data.buffer.length; i++) {
      if (!deleteSet.has(i)) {
        result[destIdx++] = data.buffer[i]
      }
    }

    return new NDArray({
      buffer: result,
      shape: [newLength],
      strides: [1],
      dtype: data.dtype,
    })
  }

  // Delete along axis 0
  if (data.shape.length === 0) {
    throw new Error('Cannot delete from 0-dimensional array')
  }

  const rows = data.shape[0]
  const deleteSet = new Set(indicesArray.map((idx) => (idx < 0 ? rows + idx : idx)))

  const newRows = rows - deleteSet.size

  if (data.shape.length === 1) {
    // 1D case
    const result = createTypedArray(newRows, data.dtype)
    let destIdx = 0

    for (let i = 0; i < rows; i++) {
      if (!deleteSet.has(i)) {
        result[destIdx++] = data.buffer[i]
      }
    }

    return new NDArray({
      buffer: result,
      shape: [newRows],
      strides: [1],
      dtype: data.dtype,
    })
  }

  // Multi-dimensional case
  const rowSize = data.buffer.length / rows
  const result = createTypedArray(newRows * rowSize, data.dtype)
  let destIdx = 0

  for (let i = 0; i < rows; i++) {
    if (!deleteSet.has(i)) {
      for (let j = 0; j < rowSize; j++) {
        result[destIdx++] = data.buffer[i * rowSize + j]
      }
    }
  }

  const newShape = [newRows, ...data.shape.slice(1)]

  return new NDArray({
    buffer: result,
    shape: newShape,
    strides: newShape.map((_, i) => newShape.slice(i + 1).reduce((a, b) => a * b, 1)),
    dtype: data.dtype,
  })
}

/**
 * Insert values along axis before indices
 */
export function insert<T extends DType>(
  arr: NDArray<T>,
  index: number | number[],
  values: number | number[] | NDArray<T>,
  axis?: number,
): NDArray<T> {
  const data = arr.getData()

  if (axis !== undefined && axis !== 0) {
    throw new Error('insert only supports axis=0 or no axis')
  }

  let valuesArray: number[]
  if (typeof values === 'number') {
    valuesArray = [values]
  } else if (Array.isArray(values)) {
    valuesArray = values
  } else {
    valuesArray = Array.from(values.getData().buffer)
  }

  const indicesArray = Array.isArray(index) ? index : [index]

  if (axis === undefined) {
    // Flatten and insert
    const newLength = data.buffer.length + valuesArray.length * indicesArray.length
    const result = createTypedArray(newLength, data.dtype)

    // Create insertion map
    const insertMap = new Map<number, number[]>()
    for (const idx of indicesArray) {
      const normalizedIdx = idx < 0 ? data.buffer.length + idx : idx
      if (!insertMap.has(normalizedIdx)) {
        insertMap.set(normalizedIdx, [])
      }
      insertMap.get(normalizedIdx)!.push(...valuesArray)
    }

    let destIdx = 0
    for (let i = 0; i <= data.buffer.length; i++) {
      if (insertMap.has(i)) {
        for (const val of insertMap.get(i)!) {
          result[destIdx++] = val
        }
      }
      if (i < data.buffer.length) {
        result[destIdx++] = data.buffer[i]
      }
    }

    return new NDArray({
      buffer: result,
      shape: [newLength],
      strides: [1],
      dtype: data.dtype,
    })
  }

  throw new Error('insert with axis not yet implemented')
}

/**
 * Append values to the end of array
 */
export function append<T extends DType>(
  arr: NDArray<T>,
  values: number | number[] | NDArray<T>,
  axis?: number,
): NDArray<T> {
  const data = arr.getData()

  let valuesArray: number[]
  if (typeof values === 'number') {
    valuesArray = [values]
  } else if (Array.isArray(values)) {
    valuesArray = values
  } else {
    valuesArray = Array.from(values.getData().buffer)
  }

  if (axis !== undefined) {
    throw new Error('append with axis not yet implemented')
  }

  // Flatten and append
  const newLength = data.buffer.length + valuesArray.length
  const result = createTypedArray(newLength, data.dtype)

  for (let i = 0; i < data.buffer.length; i++) {
    result[i] = data.buffer[i]
  }

  for (let i = 0; i < valuesArray.length; i++) {
    result[data.buffer.length + i] = valuesArray[i]
  }

  return new NDArray({
    buffer: result,
    shape: [newLength],
    strides: [1],
    dtype: data.dtype,
  })
}

/**
 * Return new array with new shape
 * If new size is larger, pad with zeros
 */
export function resize<T extends DType>(arr: NDArray<T>, newShape: number[]): NDArray<T> {
  const data = arr.getData()
  const newSize = newShape.reduce((a, b) => a * b, 1)
  const result = createTypedArray(newSize, data.dtype)

  // Copy existing data, cycling if necessary
  for (let i = 0; i < newSize; i++) {
    result[i] = data.buffer[i % data.buffer.length]
  }

  return new NDArray({
    buffer: result,
    shape: newShape,
    strides: newShape.map((_, i) => newShape.slice(i + 1).reduce((a, b) => a * b, 1)),
    dtype: data.dtype,
  })
}

/**
 * Roll array elements along axis
 */
export function roll<T extends DType>(arr: NDArray<T>, shift: number, axis?: number): NDArray<T> {
  const data = arr.getData()

  if (axis !== undefined && axis !== 0) {
    throw new Error('roll only supports axis=0 or no axis')
  }

  if (axis === undefined) {
    // Roll flattened array
    const n = data.buffer.length
    if (n === 0) {
      return arr
    }

    const normalizedShift = ((shift % n) + n) % n
    const result = createTypedArray(n, data.dtype)

    for (let i = 0; i < n; i++) {
      result[(i + normalizedShift) % n] = data.buffer[i]
    }

    return new NDArray({
      buffer: result,
      shape: [...data.shape],
      strides: [...data.strides],
      dtype: data.dtype,
    })
  }

  // Roll along axis 0
  if (data.shape.length === 0) {
    return arr
  }

  const rows = data.shape[0]
  const normalizedShift = ((shift % rows) + rows) % rows

  if (data.shape.length === 1) {
    // 1D case
    const result = createTypedArray(rows, data.dtype)
    for (let i = 0; i < rows; i++) {
      result[(i + normalizedShift) % rows] = data.buffer[i]
    }

    return new NDArray({
      buffer: result,
      shape: [...data.shape],
      strides: [...data.strides],
      dtype: data.dtype,
    })
  }

  // Multi-dimensional case
  const rowSize = data.buffer.length / rows
  const result = createTypedArray(data.buffer.length, data.dtype)

  for (let i = 0; i < rows; i++) {
    const destRow = (i + normalizedShift) % rows
    for (let j = 0; j < rowSize; j++) {
      result[destRow * rowSize + j] = data.buffer[i * rowSize + j]
    }
  }

  return new NDArray({
    buffer: result,
    shape: [...data.shape],
    strides: [...data.strides],
    dtype: data.dtype,
  })
}
