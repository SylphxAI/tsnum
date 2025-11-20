/* tslint:disable */
/* eslint-disable */
/**
 * Mean of all elements
 */
export function mean(a: Float64Array): number
/**
 * Minimum element
 */
export function min(a: Float64Array): number
/**
 * Add scalar to array
 */
export function add_scalar(a: Float64Array, scalar: number): Float64Array
/**
 * Standard deviation
 */
export function std(a: Float64Array): number
/**
 * Sum all elements
 */
export function sum(a: Float64Array): number
/**
 * Multiply array by scalar
 */
export function mul_scalar(a: Float64Array, scalar: number): Float64Array
/**
 * Power: raise array elements to exponent
 */
export function pow_scalar(a: Float64Array, exponent: number): Float64Array
/**
 * Divide array by scalar
 */
export function div_scalar(a: Float64Array, scalar: number): Float64Array
/**
 * Subtract scalar from array
 */
export function sub_scalar(a: Float64Array, scalar: number): Float64Array
/**
 * Subtract two arrays element-wise
 */
export function sub_arrays(a: Float64Array, b: Float64Array): Float64Array
/**
 * Maximum element
 */
export function max(a: Float64Array): number
/**
 * Add two arrays element-wise (with broadcasting)
 */
export function add_arrays(a: Float64Array, b: Float64Array): Float64Array
/**
 * Multiply two arrays element-wise
 */
export function mul_arrays(a: Float64Array, b: Float64Array): Float64Array
/**
 * Variance
 */
export function variance(a: Float64Array): number
/**
 * Divide two arrays element-wise
 */
export function div_arrays(a: Float64Array, b: Float64Array): Float64Array

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module

export interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly add_arrays: (a: number, b: number, c: number, d: number) => [number, number]
  readonly add_scalar: (a: number, b: number, c: number) => [number, number]
  readonly div_arrays: (a: number, b: number, c: number, d: number) => [number, number]
  readonly div_scalar: (a: number, b: number, c: number) => [number, number]
  readonly max: (a: number, b: number) => number
  readonly mean: (a: number, b: number) => number
  readonly min: (a: number, b: number) => number
  readonly mul_arrays: (a: number, b: number, c: number, d: number) => [number, number]
  readonly mul_scalar: (a: number, b: number, c: number) => [number, number]
  readonly pow_scalar: (a: number, b: number, c: number) => [number, number]
  readonly std: (a: number, b: number) => number
  readonly sub_arrays: (a: number, b: number, c: number, d: number) => [number, number]
  readonly sub_scalar: (a: number, b: number, c: number) => [number, number]
  readonly sum: (a: number, b: number) => number
  readonly variance: (a: number, b: number) => number
  readonly __wbindgen_externrefs: WebAssembly.Table
  readonly __wbindgen_malloc: (a: number, b: number) => number
  readonly __wbindgen_free: (a: number, b: number, c: number) => void
  readonly __wbindgen_start: () => void
}

export type SyncInitInput = BufferSource | WebAssembly.Module
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>
