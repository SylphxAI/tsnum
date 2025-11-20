// ===== Advanced Array Assembly Operations =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import type { NDArray } from '../ndarray'
import { NDArray } from '../ndarray'

/**
 * Assemble arrays from blocks
 * Similar to np.block() - builds arrays from nested lists of arrays
 *
 * @example
 * const A = array([[1, 2], [3, 4]])
 * const B = array([[5], [6]])
 * block([[A, B]]) // [[1, 2, 5], [3, 4, 6]]
 */
export function block<T extends DType>(arrays: any): NDArray<T> {
  // Determine depth and validate structure
  const depth = getDepth(arrays)

  if (depth === 0) {
    throw new Error('block requires at least one array')
  }

  if (depth === 1) {
    // Single level: concatenate arrays
    return concatenateArrays(arrays, 0)
  }

  if (depth === 2) {
    // Two levels: horizontal then vertical stacking
    const rows: NDArray<T>[] = []
    for (const row of arrays) {
      if (!Array.isArray(row)) {
        throw new Error('Invalid block structure')
      }
      rows.push(concatenateArrays(row, 1))
    }
    return concatenateArrays(rows, 0)
  }

  // Recursive case for deeper nesting
  throw new Error('block only supports up to 2D nesting')
}

/**
 * Stack 1D arrays as columns into a 2D array
 *
 * @example
 * const a = array([1, 2, 3])
 * const b = array([4, 5, 6])
 * column_stack([a, b]) // [[1, 4], [2, 5], [3, 6]]
 */
export function column_stack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('column_stack requires at least one array')
  }

  // Convert 1D arrays to column vectors
  const columns: NDArray<T>[] = []
  for (const arr of arrays) {
    const data = arr.getData()

    if (data.shape.length === 1) {
      // Reshape to column vector
      const size = data.shape[0]
      columns.push(new NDArray({
        buffer: data.buffer.slice(),
        shape: [size, 1],
        strides: [1, 1],
        dtype: data.dtype,
      }))
    } else if (data.shape.length === 2) {
      columns.push(arr)
    } else {
      throw new Error('column_stack only supports 1D and 2D arrays')
    }
  }

  // Concatenate along axis 1
  return concatenateArrays(columns, 1)
}

/**
 * Split array into multiple sub-arrays
 * Unlike split(), allows unequal sub-array sizes
 *
 * @example
 * const arr = array([1, 2, 3, 4, 5, 6, 7])
 * array_split(arr, 3) // [[1, 2, 3], [4, 5], [6, 7]]
 */
export function array_split<T extends DType>(
  arr: NDArray<T>,
  indicesOrSections: number | number[],
  axis = 0,
): NDArray<T>[] {
  const data = arr.getData()

  if (axis < 0 || axis >= data.shape.length) {
    throw new Error(`Invalid axis: ${axis}`)
  }

  const axisSize = data.shape[axis]

  if (typeof indicesOrSections === 'number') {
    // Split into N sub-arrays (possibly unequal)
    const n = indicesOrSections
    const baseSize = Math.floor(axisSize / n)
    const remainder = axisSize % n

    const indices: number[] = []
    let currentIdx = 0
    for (let i = 0; i < n; i++) {
      const size = baseSize + (i < remainder ? 1 : 0)
      currentIdx += size
      if (i < n - 1) {
        indices.push(currentIdx)
      }
    }

    return splitAtIndices(arr, indices, axis)
  }

  // Split at specific indices
  return splitAtIndices(arr, indicesOrSections, axis)
}

/**
 * Stack arrays along the 3rd axis (depth-wise)
 *
 * @example
 * const a = array([[1, 2], [3, 4]])
 * const b = array([[5, 6], [7, 8]])
 * dstack([a, b]) // [[[1, 5], [2, 6]], [[3, 7], [4, 8]]]
 */
export function dstack<T extends DType>(arrays: NDArray<T>[]): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('dstack requires at least one array')
  }

  // Ensure all arrays are at least 3D
  const arrays3d: NDArray<T>[] = []
  for (const arr of arrays) {
    const data = arr.getData()

    if (data.shape.length === 1) {
      // Reshape [n] -> [1, n, 1]
      const n = data.shape[0]
      arrays3d.push(new NDArray({
        buffer: data.buffer.slice(),
        shape: [1, n, 1],
        strides: [n, 1, 1],
        dtype: data.dtype,
      }))
    } else if (data.shape.length === 2) {
      // Reshape [m, n] -> [m, n, 1]
      const [m, n] = data.shape
      arrays3d.push(new NDArray({
        buffer: data.buffer.slice(),
        shape: [m, n, 1],
        strides: [n, 1, 1],
        dtype: data.dtype,
      }))
    } else if (data.shape.length === 3) {
      arrays3d.push(arr)
    } else {
      throw new Error('dstack only supports arrays up to 3D')
    }
  }

  // Concatenate along axis 2
  return concatenateArrays(arrays3d, 2)
}

// ===== Helper Functions =====

function getDepth(arr: any): number {
  if (!Array.isArray(arr)) {
    return 0
  }
  if (arr.length === 0) {
    return 1
  }
  return 1 + Math.max(...arr.map(getDepth))
}

function concatenateArrays<T extends DType>(arrays: NDArray<T>[], axis: number): NDArray<T> {
  if (arrays.length === 0) {
    throw new Error('concatenate requires at least one array')
  }

  if (arrays.length === 1) {
    return arrays[0]
  }

  const firstData = arrays[0].getData()
  const dtype = firstData.dtype
  const ndim = firstData.shape.length

  // Validate all arrays have same shape except along concatenation axis
  for (let i = 1; i < arrays.length; i++) {
    const data = arrays[i].getData()
    if (data.shape.length !== ndim) {
      throw new Error('All arrays must have the same number of dimensions')
    }
    for (let d = 0; d < ndim; d++) {
      if (d !== axis && data.shape[d] !== firstData.shape[d]) {
        throw new Error('All arrays must have the same shape except along concatenation axis')
      }
    }
  }

  // Calculate output shape
  const outShape = firstData.shape.slice()
  outShape[axis] = arrays.reduce((sum, arr) => sum + arr.getData().shape[axis], 0)

  // Calculate output size
  const outSize = outShape.reduce((a, b) => a * b, 1)
  const outBuffer = createTypedArray(outSize, dtype)

  // Copy data
  if (axis === ndim - 1) {
    // Concatenating along last axis - can copy contiguous blocks
    let offset = 0
    const blockSize = firstData.shape.slice(0, -1).reduce((a, b) => a * b, 1)

    for (const arr of arrays) {
      const data = arr.getData()
      const axisSize = data.shape[axis]

      for (let block = 0; block < blockSize; block++) {
        for (let i = 0; i < axisSize; i++) {
          outBuffer[offset++] = data.buffer[block * axisSize + i]
        }
      }
    }
  } else {
    // General case
    const copySlice = (arrIdx: number, outIdx: number[], arrOutIdx: number[]) => {
      if (outIdx.length === ndim) {
        const arr = arrays[arrIdx]
        const data = arr.getData()
        const flatIdx = outIdx.reduce((acc, idx, d) => acc * outShape[d] + idx, 0)
        const arrFlatIdx = arrOutIdx.reduce((acc, idx, d) => acc * data.shape[d] + idx, 0)
        outBuffer[flatIdx] = data.buffer[arrFlatIdx]
        return
      }

      const d = outIdx.length
      if (d === axis) {
        // Iterate through arrays
        let axisOffset = 0
        for (let i = 0; i < arrays.length; i++) {
          const data = arrays[i].getData()
          const axisSize = data.shape[axis]

          for (let j = 0; j < axisSize; j++) {
            copySlice(i, [...outIdx, axisOffset + j], [...arrOutIdx, j])
          }

          axisOffset += axisSize
        }
      } else {
        // Iterate through dimension
        for (let i = 0; i < outShape[d]; i++) {
          copySlice(arrIdx, [...outIdx, i], [...arrOutIdx, i])
        }
      }
    }

    copySlice(0, [], [])
  }

  // Compute strides
  const outStrides: number[] = []
  let stride = 1
  for (let i = ndim - 1; i >= 0; i--) {
    outStrides.unshift(stride)
    stride *= outShape[i]
  }

  return new NDArray({
    buffer: outBuffer,
    shape: outShape,
    strides: outStrides,
    dtype,
  })
}

function splitAtIndices<T extends DType>(
  arr: NDArray<T>,
  indices: number[],
  axis: number,
): NDArray<T>[] {
  const data = arr.getData()
  const axisSize = data.shape[axis]

  // Build split points
  const splitPoints = [0, ...indices, axisSize]
  const results: NDArray<T>[] = []

  for (let i = 0; i < splitPoints.length - 1; i++) {
    const start = splitPoints[i]
    const stop = splitPoints[i + 1]

    if (start >= stop) continue

    // Create slice for this section
    const newShape = data.shape.slice()
    newShape[axis] = stop - start

    const newSize = newShape.reduce((a, b) => a * b, 1)
    const newBuffer = createTypedArray(newSize, data.dtype)

    // Copy data
    const ndim = data.shape.length
    let destIdx = 0

    const copySlice = (indices: number[]) => {
      if (indices.length === ndim) {
        const srcIdx = indices.reduce((acc, idx, d) => {
          return acc + idx * data.strides[d]
        }, 0)
        newBuffer[destIdx++] = data.buffer[srcIdx]
        return
      }

      const d = indices.length
      if (d === axis) {
        for (let j = start; j < stop; j++) {
          copySlice([...indices, j])
        }
      } else {
        for (let j = 0; j < data.shape[d]; j++) {
          copySlice([...indices, j])
        }
      }
    }

    copySlice([])

    // Compute strides
    const newStrides: number[] = []
    let stride = 1
    for (let d = ndim - 1; d >= 0; d--) {
      newStrides.unshift(stride)
      stride *= newShape[d]
    }

    results.push(new NDArray({
      buffer: newBuffer,
      shape: newShape,
      strides: newStrides,
      dtype: data.dtype,
    }))
  }

  return results
}
