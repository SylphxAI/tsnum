/* tslint:disable */
/* eslint-disable */
/**
 * Mean of all elements
 */
export function mean(a: Float64Array): number;
/**
 * Minimum element
 */
export function min(a: Float64Array): number;
/**
 * Add scalar to array
 */
export function add_scalar(a: Float64Array, scalar: number): Float64Array;
/**
 * Standard deviation
 */
export function std(a: Float64Array): number;
/**
 * Sum all elements
 */
export function sum(a: Float64Array): number;
/**
 * Fast Fourier Transform (Cooley-Tukey algorithm)
 * Input: real-valued array of length n (must be power of 2)
 * Output: interleaved [real, imag] pairs (length 2n)
 */
export function fft(input: Float64Array): Float64Array;
/**
 * Element-wise tangent
 */
export function tan_array(a: Float64Array): Float64Array;
/**
 * Multiply array by scalar
 */
export function mul_scalar(a: Float64Array, scalar: number): Float64Array;
/**
 * Power: raise array elements to exponent
 */
export function pow_scalar(a: Float64Array, exponent: number): Float64Array;
/**
 * Element-wise absolute value
 */
export function abs_array(a: Float64Array): Float64Array;
/**
 * Divide array by scalar
 */
export function div_scalar(a: Float64Array, scalar: number): Float64Array;
/**
 * Element-wise base-10 logarithm
 */
export function log10_array(a: Float64Array): Float64Array;
/**
 * Element-wise exponential (e^x)
 */
export function exp_array(a: Float64Array): Float64Array;
/**
 * Dot product (inner product) of two 1D arrays
 */
export function dot(a: Float64Array, b: Float64Array): number;
/**
 * Subtract scalar from array
 */
export function sub_scalar(a: Float64Array, scalar: number): Float64Array;
/**
 * Subtract two arrays element-wise
 */
export function sub_arrays(a: Float64Array, b: Float64Array): Float64Array;
/**
 * Element-wise cosine
 */
export function cos_array(a: Float64Array): Float64Array;
/**
 * Element-wise sine
 */
export function sin_array(a: Float64Array): Float64Array;
/**
 * Matrix multiplication: C = A @ B
 * A is m×k, B is k×n, result is m×n
 */
export function matmul(a: Float64Array, b: Float64Array, m: number, k: number, n: number): Float64Array;
/**
 * Maximum element
 */
export function max(a: Float64Array): number;
/**
 * Inverse Fast Fourier Transform
 * Input: interleaved [real, imag] pairs (length 2n)
 * Output: interleaved [real, imag] pairs (length 2n)
 */
export function ifft(input: Float64Array, n: number): Float64Array;
/**
 * Add two arrays element-wise (with broadcasting)
 */
export function add_arrays(a: Float64Array, b: Float64Array): Float64Array;
/**
 * Multiply two arrays element-wise
 */
export function mul_arrays(a: Float64Array, b: Float64Array): Float64Array;
/**
 * Element-wise natural logarithm
 */
export function log_array(a: Float64Array): Float64Array;
/**
 * Variance
 */
export function variance(a: Float64Array): number;
/**
 * Element-wise square root
 */
export function sqrt_array(a: Float64Array): Float64Array;
/**
 * Divide two arrays element-wise
 */
export function div_arrays(a: Float64Array, b: Float64Array): Float64Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly abs_array: (a: number, b: number) => [number, number];
  readonly add_arrays: (a: number, b: number, c: number, d: number) => [number, number];
  readonly add_scalar: (a: number, b: number, c: number) => [number, number];
  readonly cos_array: (a: number, b: number) => [number, number];
  readonly div_arrays: (a: number, b: number, c: number, d: number) => [number, number];
  readonly div_scalar: (a: number, b: number, c: number) => [number, number];
  readonly dot: (a: number, b: number, c: number, d: number) => number;
  readonly exp_array: (a: number, b: number) => [number, number];
  readonly fft: (a: number, b: number) => [number, number];
  readonly ifft: (a: number, b: number, c: number) => [number, number];
  readonly log10_array: (a: number, b: number) => [number, number];
  readonly log_array: (a: number, b: number) => [number, number];
  readonly matmul: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly max: (a: number, b: number) => number;
  readonly mean: (a: number, b: number) => number;
  readonly min: (a: number, b: number) => number;
  readonly mul_arrays: (a: number, b: number, c: number, d: number) => [number, number];
  readonly mul_scalar: (a: number, b: number, c: number) => [number, number];
  readonly pow_scalar: (a: number, b: number, c: number) => [number, number];
  readonly sin_array: (a: number, b: number) => [number, number];
  readonly sqrt_array: (a: number, b: number) => [number, number];
  readonly std: (a: number, b: number) => number;
  readonly sub_arrays: (a: number, b: number, c: number, d: number) => [number, number];
  readonly sub_scalar: (a: number, b: number, c: number) => [number, number];
  readonly sum: (a: number, b: number) => number;
  readonly tan_array: (a: number, b: number) => [number, number];
  readonly variance: (a: number, b: number) => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
