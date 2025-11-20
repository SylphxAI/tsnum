import type { AxisOptions, DType, NDArrayData } from './core/types'
import { computeSize, computeStrides, indexToOffset } from './core/utils'

// ===== NDArray Class (OOP Shell) =====
export class NDArray<T extends DType = DType> {
  private data: NDArrayData

  constructor(data: NDArrayData) {
    this.data = data
  }

  // ===== Properties =====
  get shape(): readonly number[] {
    return this.data.shape
  }

  get dtype(): T {
    return this.data.dtype as T
  }

  get ndim(): number {
    return this.data.shape.length
  }

  get size(): number {
    return this.data.buffer.length
  }

  get buffer(): ArrayBufferLike {
    return this.data.buffer.buffer
  }

  // ===== Internal data access =====
  getData(): NDArrayData {
    return this.data
  }

  // ===== Indexing =====
  get(i: number): number
  get(i: number, j: number): number
  get(...indices: number[]): number {
    if (indices.length !== this.ndim) {
      throw new Error(`Expected ${this.ndim} indices, got ${indices.length}`)
    }

    // Validate indices
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] < 0 || indices[i] >= this.shape[i]) {
        throw new Error(
          `Index ${indices[i]} out of bounds for axis ${i} with size ${this.shape[i]}`,
        )
      }
    }

    const offset = indexToOffset(indices, this.data.strides)
    return this.data.buffer[offset]
  }

  // Alias for get
  at(...indices: number[]): number {
    // @ts-expect-error: Spread array to variadic parameter
    return this.get(...indices)
  }

  // ===== Arithmetic operations =====
  add(other: NDArray | number): NDArray<T> {
    if (typeof other === 'number') {
      return this.scalarOp(other, (a, b) => a + b)
    }
    return this.elementwiseOp(other, (a, b) => a + b)
  }

  sub(other: NDArray | number): NDArray<T> {
    if (typeof other === 'number') {
      return this.scalarOp(other, (a, b) => a - b)
    }
    return this.elementwiseOp(other, (a, b) => a - b)
  }

  mul(other: NDArray | number): NDArray<T> {
    if (typeof other === 'number') {
      return this.scalarOp(other, (a, b) => a * b)
    }
    return this.elementwiseOp(other, (a, b) => a * b)
  }

  div(other: NDArray | number): NDArray<T> {
    if (typeof other === 'number') {
      return this.scalarOp(other, (a, b) => a / b)
    }
    return this.elementwiseOp(other, (a, b) => a / b)
  }

  pow(exponent: number): NDArray<T> {
    return this.scalarOp(exponent, (a, b) => a ** b)
  }

  // ===== Comparison operations =====
  eq(other: NDArray | number): NDArray<'uint8'> {
    if (typeof other === 'number') {
      return this.scalarCompare(other, (a, b) => a === b)
    }
    return this.elementwiseCompare(other, (a, b) => a === b)
  }

  lt(other: NDArray | number): NDArray<'uint8'> {
    if (typeof other === 'number') {
      return this.scalarCompare(other, (a, b) => a < b)
    }
    return this.elementwiseCompare(other, (a, b) => a < b)
  }

  gt(other: NDArray | number): NDArray<'uint8'> {
    if (typeof other === 'number') {
      return this.scalarCompare(other, (a, b) => a > b)
    }
    return this.elementwiseCompare(other, (a, b) => a > b)
  }

  lte(other: NDArray | number): NDArray<'uint8'> {
    if (typeof other === 'number') {
      return this.scalarCompare(other, (a, b) => a <= b)
    }
    return this.elementwiseCompare(other, (a, b) => a <= b)
  }

  gte(other: NDArray | number): NDArray<'uint8'> {
    if (typeof other === 'number') {
      return this.scalarCompare(other, (a, b) => a >= b)
    }
    return this.elementwiseCompare(other, (a, b) => a >= b)
  }

  // ===== Reduction operations =====
  sum(options?: AxisOptions): NDArray | number {
    if (options?.axis === undefined) {
      // Sum all elements
      let total = 0
      for (let i = 0; i < this.data.buffer.length; i++) {
        total += this.data.buffer[i]
      }
      return total
    }
    throw new Error('Axis reduction not yet implemented')
  }

  mean(options?: AxisOptions): NDArray | number {
    if (options?.axis === undefined) {
      const total = this.sum() as number
      return total / this.size
    }
    throw new Error('Axis reduction not yet implemented')
  }

  max(options?: AxisOptions): NDArray | number {
    if (options?.axis === undefined) {
      let maxVal = Number.NEGATIVE_INFINITY
      for (let i = 0; i < this.data.buffer.length; i++) {
        maxVal = Math.max(maxVal, this.data.buffer[i])
      }
      return maxVal
    }
    throw new Error('Axis reduction not yet implemented')
  }

  min(options?: AxisOptions): NDArray | number {
    if (options?.axis === undefined) {
      let minVal = Number.POSITIVE_INFINITY
      for (let i = 0; i < this.data.buffer.length; i++) {
        minVal = Math.min(minVal, this.data.buffer[i])
      }
      return minVal
    }
    throw new Error('Axis reduction not yet implemented')
  }

  // ===== Shape operations =====
  reshape(shape: number[]): NDArray<T> {
    const newSize = computeSize(shape)
    if (newSize !== this.size) {
      throw new Error(`Cannot reshape array of size ${this.size} into shape ${shape}`)
    }

    const newData: NDArrayData = {
      buffer: this.data.buffer,
      shape,
      strides: computeStrides(shape),
      dtype: this.dtype,
    }

    return new NDArray(newData)
  }

  flatten(): NDArray<T> {
    return this.reshape([this.size])
  }

  // ===== Transpose =====
  get T(): NDArray<T> {
    return this.transpose()
  }

  transpose(): NDArray<T> {
    if (this.ndim !== 2) {
      throw new Error('Transpose only supported for 2D arrays')
    }

    const [rows, cols] = this.shape
    const newShape = [cols, rows]
    const newStrides = computeStrides(newShape)
    const newBuffer = new (this.data.buffer.constructor as any)(this.size)

    // Copy with transposed indices
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const srcOffset = indexToOffset([i, j], this.data.strides)
        const dstOffset = indexToOffset([j, i], newStrides)
        newBuffer[dstOffset] = this.data.buffer[srcOffset]
      }
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: newShape,
      strides: newStrides,
      dtype: this.dtype,
    }

    return new NDArray(newData)
  }

  // ===== Utilities =====
  copy(): NDArray<T> {
    const newBuffer = new (this.data.buffer.constructor as any)(this.size)
    newBuffer.set(this.data.buffer)

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: [...this.shape],
      strides: [...this.data.strides],
      dtype: this.dtype,
    }

    return new NDArray(newData)
  }

  // ===== Private helpers =====
  private scalarOp(scalar: number, op: (a: number, b: number) => number): NDArray<T> {
    const newBuffer = new (this.data.buffer.constructor as any)(this.size)

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] = op(this.data.buffer[i], scalar)
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: this.shape,
      strides: this.data.strides,
      dtype: this.dtype,
    }

    return new NDArray(newData)
  }

  private elementwiseOp(other: NDArray, op: (a: number, b: number) => number): NDArray<T> {
    // ASSUMPTION: Same shape (broadcasting not yet implemented)
    if (!this.shapeEquals(other.shape)) {
      throw new Error('Shape mismatch: broadcasting not yet implemented')
    }

    const newBuffer = new (this.data.buffer.constructor as any)(this.size)
    const otherData = other.getData()

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] = op(this.data.buffer[i], otherData.buffer[i])
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: this.shape,
      strides: this.data.strides,
      dtype: this.dtype,
    }

    return new NDArray(newData)
  }

  private scalarCompare(scalar: number, op: (a: number, b: number) => boolean): NDArray<'uint8'> {
    const newBuffer = new Uint8Array(this.size)

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] = op(this.data.buffer[i], scalar) ? 1 : 0
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: this.shape,
      strides: this.data.strides,
      dtype: 'uint8',
    }

    return new NDArray(newData)
  }

  private elementwiseCompare(
    other: NDArray,
    op: (a: number, b: number) => boolean,
  ): NDArray<'uint8'> {
    if (!this.shapeEquals(other.shape)) {
      throw new Error('Shape mismatch: broadcasting not yet implemented')
    }

    const newBuffer = new Uint8Array(this.size)
    const otherData = other.getData()

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] = op(this.data.buffer[i], otherData.buffer[i]) ? 1 : 0
    }

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: this.shape,
      strides: this.data.strides,
      dtype: 'uint8',
    }

    return new NDArray(newData)
  }

  private shapeEquals(other: readonly number[]): boolean {
    if (this.shape.length !== other.length) return false
    for (let i = 0; i < this.shape.length; i++) {
      if (this.shape[i] !== other[i]) return false
    }
    return true
  }

  // ===== String representation =====
  toString(): string {
    return this.toStringHelper(0, [])
  }

  private toStringHelper(axis: number, indices: number[]): string {
    if (axis === this.ndim) {
      // @ts-expect-error: Spread array to variadic parameter
      return this.get(...indices).toString()
    }

    const parts: string[] = []
    for (let i = 0; i < this.shape[axis]; i++) {
      parts.push(this.toStringHelper(axis + 1, [...indices, i]))
    }

    return `[${parts.join(', ')}]`
  }
}
