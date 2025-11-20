// ===== DType System =====
export type DType =
  | 'float64'
  | 'float32'
  | 'int32'
  | 'int16'
  | 'int8'
  | 'uint32'
  | 'uint16'
  | 'uint8'

export type TypedArray =
  | Float64Array
  | Float32Array
  | Int32Array
  | Int16Array
  | Int8Array
  | Uint32Array
  | Uint16Array
  | Uint8Array

// Map DType to TypedArray constructor
export const DTYPE_TO_TYPEDARRAY = {
  float64: Float64Array,
  float32: Float32Array,
  int32: Int32Array,
  int16: Int16Array,
  int8: Int8Array,
  uint32: Uint32Array,
  uint16: Uint16Array,
  uint8: Uint8Array,
} as const

// Map TypedArray to DType
// biome-ignore lint/complexity/noBannedTypes: TypedArray constructors need Function type
export const TYPEDARRAY_TO_DTYPE = new Map<Function, DType>([
  [Float64Array, 'float64'],
  [Float32Array, 'float32'],
  [Int32Array, 'int32'],
  [Int16Array, 'int16'],
  [Int8Array, 'int8'],
  [Uint32Array, 'uint32'],
  [Uint16Array, 'uint16'],
  [Uint8Array, 'uint8'],
])

// Default dtype for different input types
export function inferDType(value: any): DType {
  if (Number.isInteger(value)) return 'int32'
  return 'float64'
}

// ===== Core Data Structure (Pure, Immutable) =====
export type NDArrayData = {
  readonly buffer: TypedArray
  readonly shape: readonly number[]
  readonly strides: readonly number[]
  readonly dtype: DType
}

// ===== Options =====
export type ArrayOptions = {
  dtype?: DType
}

export type AxisOptions = {
  axis?: number
  keepdims?: boolean
}
