/* tslint:disable */
/* eslint-disable */
/**
 * Matrix transpose
 */
export function transpose_matrix(a: Float64Array, rows: number, cols: number): Float64Array;
/**
 * Mean of all elements
 */
export function mean(a: Float64Array): number;
/**
 * Inverse Fast Fourier Transform
 * Input: interleaved [real, imag] pairs (length 2n)
 * Output: interleaved [real, imag] pairs (length 2n)
 */
export function ifft(input: Float64Array, n: number): Float64Array;
/**
 * Minimum element
 */
export function min(a: Float64Array): number;
export function minimum_arrays(a: Float64Array, b: Float64Array): Float64Array;
export function mod_arrays(a: Float64Array, b: Float64Array): Float64Array;
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
export function ceil_array(a: Float64Array): Float64Array;
export function log2_array(a: Float64Array): Float64Array;
/**
 * Element-wise natural logarithm
 */
export function log_array(a: Float64Array): Float64Array;
export function arctan2_arrays(y: Float64Array, x: Float64Array): Float64Array;
/**
 * Multiply array by scalar
 */
export function mul_scalar(a: Float64Array, scalar: number): Float64Array;
export function acosh_array(a: Float64Array): Float64Array;
export function maximum_arrays(a: Float64Array, b: Float64Array): Float64Array;
export function arccos_array(a: Float64Array): Float64Array;
export function clip_array(a: Float64Array, min: number, max: number): Float64Array;
export function fmod_scalar(a: Float64Array, b: number): Float64Array;
/**
 * Power: raise array elements to exponent
 */
export function pow_scalar(a: Float64Array, exponent: number): Float64Array;
/**
 * Fast Fourier Transform (Cooley-Tukey algorithm)
 * Input: real-valued array of length n (must be power of 2)
 * Output: interleaved [real, imag] pairs (length 2n)
 */
export function fft(input: Float64Array): Float64Array;
export function sinh_array(a: Float64Array): Float64Array;
export function fmod_arrays(a: Float64Array, b: Float64Array): Float64Array;
/**
 * Element-wise absolute value
 */
export function abs_array(a: Float64Array): Float64Array;
/**
 * Divide array by scalar
 */
export function div_scalar(a: Float64Array, scalar: number): Float64Array;
export function atanh_array(a: Float64Array): Float64Array;
export function trunc_array(a: Float64Array): Float64Array;
/**
 * Element-wise exponential (e^x)
 */
export function exp_array(a: Float64Array): Float64Array;
/**
 * Element-wise cosine
 */
export function cos_array(a: Float64Array): Float64Array;
export function floor_array(a: Float64Array): Float64Array;
export function cbrt_array(a: Float64Array): Float64Array;
/**
 * Dot product (inner product) of two 1D arrays
 */
export function dot(a: Float64Array, b: Float64Array): number;
export function round_array(a: Float64Array): Float64Array;
export function sign_array(a: Float64Array): Float64Array;
/**
 * Subtract scalar from array
 */
export function sub_scalar(a: Float64Array, scalar: number): Float64Array;
export function mod_scalar(a: Float64Array, b: number): Float64Array;
/**
 * Subtract two arrays element-wise
 */
export function sub_arrays(a: Float64Array, b: Float64Array): Float64Array;
export function expm1_array(a: Float64Array): Float64Array;
export function exp2_array(a: Float64Array): Float64Array;
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
 * Element-wise sine
 */
export function sin_array(a: Float64Array): Float64Array;
export function arcsin_array(a: Float64Array): Float64Array;
export function tanh_array(a: Float64Array): Float64Array;
export function arctan_array(a: Float64Array): Float64Array;
/**
 * Element-wise base-10 logarithm
 */
export function log10_array(a: Float64Array): Float64Array;
/**
 * Determinant for 2x2 and 3x3 matrices
 */
export function det_matrix(a: Float64Array, n: number): number;
/**
 * Element-wise tangent
 */
export function tan_array(a: Float64Array): Float64Array;
/**
 * Add two arrays element-wise (with broadcasting)
 */
export function add_arrays(a: Float64Array, b: Float64Array): Float64Array;
export function cosh_array(a: Float64Array): Float64Array;
/**
 * Multiply two arrays element-wise
 */
export function mul_arrays(a: Float64Array, b: Float64Array): Float64Array;
export function square_array(a: Float64Array): Float64Array;
/**
 * Variance
 */
export function variance(a: Float64Array): number;
export function asinh_array(a: Float64Array): Float64Array;
export function log1p_array(a: Float64Array): Float64Array;
/**
 * Element-wise square root
 */
export function sqrt_array(a: Float64Array): Float64Array;
/**
 * Matrix inverse for 2x2 and 3x3 matrices
 */
export function inv_matrix(a: Float64Array, n: number): Float64Array;
/**
 * Divide two arrays element-wise
 */
export function div_arrays(a: Float64Array, b: Float64Array): Float64Array;
