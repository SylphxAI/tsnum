import type { AxisOptions, DType, NDArrayData } from './core/types'
import { computeSize, computeStrides } from './core/utils'

// ===== NDArray Class (Pure Data Container) =====
// Methods removed - use functional API instead
export class NDArray<T extends DType = DType> {
  private data: NDArrayData

  constructor(data: NDArrayData) {
    this.data = data
  }

  // ===== Properties (read-only data access) =====
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

  // ===== Transpose property (NumPy style) =====
  get T(): NDArray<T> {
    // Import at runtime to avoid circular dependency
    const { transpose } = require('./ops/shape')
    return transpose(this)
  }

  // ===== Internal API =====
  getData(): NDArrayData {
    return this.data
  }

  // ===== Copy utility =====
  copy(): NDArray<T> {
    const newBuffer = new (this.data.buffer.constructor as any)(this.size)
    newBuffer.set(this.data.buffer)

    const newData: NDArrayData = {
      buffer: newBuffer,
      shape: this.shape.slice(),
      strides: this.data.strides.slice(),
      dtype: this.dtype,
    }

    return new NDArray<T>(newData)
  }

  // ===== String representation =====
  toString(): string {
    return this.toStringHelper(0, [])
  }

  private toStringHelper(axis: number, indices: number[]): string {
    if (axis === this.ndim) {
      return this.get(...indices).toString()
    }

    const parts: string[] = []
    for (let i = 0; i < this.shape[axis]; i++) {
      parts.push(this.toStringHelper(axis + 1, [...indices, i]))
    }

    return `[${parts.join(', ')}]`
  }

  // ===== Internal indexing (for toString) =====
  private get(...indices: number[]): number {
    const { indexToOffset } = require('./core/utils')
    if (indices.length !== this.ndim) {
      throw new Error(`Expected ${this.ndim} indices, got ${indices.length}`)
    }

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
}
