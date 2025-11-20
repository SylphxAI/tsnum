// ===== Random Number Generation =====

import type { DType } from '../core/types'
import { createTypedArray } from '../core/utils'
import { NDArray } from '../ndarray'

// Seedable random number generator (LCG - Linear Congruential Generator)
let seed = Date.now()

/**
 * Set random seed for reproducibility
 */
export function setSeed(newSeed: number): void {
  seed = newSeed
}

/**
 * Get current seed
 */
export function getSeed(): number {
  return seed
}

/**
 * Generate random number [0, 1) using LCG
 */
function rand(): number {
  // LCG parameters (same as glibc)
  const a = 1103515245
  const c = 12345
  const m = 2 ** 31

  seed = (a * seed + c) % m
  return seed / m
}

/**
 * Random values in a given shape, uniformly distributed [0, 1)
 */
export function random(shape: number | number[], dtype: DType = 'float64'): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  for (let i = 0; i < size; i++) {
    buffer[i] = rand()
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random integers from low (inclusive) to high (exclusive)
 */
export function randint(
  low: number,
  high: number,
  shape: number | number[] = 1,
  dtype: DType = 'int32',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  const range = high - low

  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(rand() * range) + low
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from standard normal distribution (mean=0, std=1)
 * Uses Box-Muller transform
 */
export function randn(shape: number | number[], dtype: DType = 'float64'): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  // Box-Muller transform generates pairs of independent normal random variables
  for (let i = 0; i < size; i += 2) {
    const u1 = rand()
    const u2 = rand()

    const r = Math.sqrt(-2 * Math.log(u1))
    const theta = 2 * Math.PI * u2

    buffer[i] = r * Math.cos(theta)
    if (i + 1 < size) {
      buffer[i + 1] = r * Math.sin(theta)
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Randomly shuffle array in-place along first axis
 */
export function shuffle<T extends DType>(a: NDArray<T>): NDArray<T> {
  const data = a.getData()

  if (data.shape.length === 1) {
    // Fisher-Yates shuffle for 1D
    const buffer = new Float64Array(data.buffer)
    for (let i = buffer.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[buffer[i], buffer[j]] = [buffer[j], buffer[i]]
    }

    // Convert back to original dtype
    const newBuffer = createTypedArray(buffer.length, data.dtype)
    for (let i = 0; i < buffer.length; i++) {
      newBuffer[i] = buffer[i]
    }

    return new NDArray({
      buffer: newBuffer,
      shape: data.shape,
      strides: data.strides,
      dtype: data.dtype,
    })
  }

  throw new Error('shuffle only supports 1D arrays for now')
}

/**
 * Random choice from array
 */
export function choice<T extends DType>(
  a: NDArray<T>,
  size?: number | number[],
  replace = true,
): NDArray<T> {
  const data = a.getData()

  if (data.shape.length !== 1) {
    throw new Error('choice only supports 1D arrays')
  }

  const sizeArray = size === undefined ? [1] : typeof size === 'number' ? [size] : size
  const totalSize = sizeArray.reduce((a, b) => a * b, 1)

  if (!replace && totalSize > data.buffer.length) {
    throw new Error('Cannot sample more elements than available without replacement')
  }

  const newBuffer = createTypedArray(totalSize, data.dtype)

  if (replace) {
    // With replacement
    for (let i = 0; i < totalSize; i++) {
      const idx = Math.floor(rand() * data.buffer.length)
      newBuffer[i] = data.buffer[idx]
    }
  } else {
    // Without replacement (reservoir sampling)
    const indices = Array.from({ length: data.buffer.length }, (_, i) => i)
    for (let i = 0; i < totalSize; i++) {
      const j = i + Math.floor(rand() * (indices.length - i))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
      newBuffer[i] = data.buffer[indices[i]]
    }
  }

  const strides = new Array(sizeArray.length)
  strides[sizeArray.length - 1] = 1
  for (let i = sizeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * sizeArray[i + 1]
  }

  return new NDArray({
    buffer: newBuffer,
    shape: sizeArray,
    strides,
    dtype: data.dtype,
  })
}

// ===== Additional Random Distributions =====

/**
 * Random samples from uniform distribution [low, high)
 */
export function uniform(
  low = 0,
  high = 1,
  shape: number | number[] = 1,
  dtype: DType = 'float64',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  const range = high - low

  for (let i = 0; i < size; i++) {
    buffer[i] = rand() * range + low
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from normal distribution with specified mean and std
 */
export function normal(
  mean = 0,
  std = 1,
  shape: number | number[] = 1,
  dtype: DType = 'float64',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  // Box-Muller transform
  for (let i = 0; i < size; i += 2) {
    const u1 = rand()
    const u2 = rand()

    const r = Math.sqrt(-2 * Math.log(u1))
    const theta = 2 * Math.PI * u2

    buffer[i] = r * Math.cos(theta) * std + mean
    if (i + 1 < size) {
      buffer[i + 1] = r * Math.sin(theta) * std + mean
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from exponential distribution
 */
export function exponential(
  scale = 1.0,
  shape: number | number[] = 1,
  dtype: DType = 'float64',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  for (let i = 0; i < size; i++) {
    // Inverse transform sampling: -ln(U) / lambda
    buffer[i] = -Math.log(1 - rand()) * scale
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from binomial distribution
 * Uses inverse transform method for small n, normal approximation for large n
 */
export function binomial(
  n: number,
  p: number,
  shape: number | number[] = 1,
  dtype: DType = 'int32',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  if (n * p > 10 && n * (1 - p) > 10) {
    // Normal approximation for large n
    const mean = n * p
    const stdDev = Math.sqrt(n * p * (1 - p))

    for (let i = 0; i < size; i++) {
      // Box-Muller transform
      const u1 = rand()
      const u2 = rand()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

      let value = Math.round(z * stdDev + mean)
      // Clamp to valid range
      value = Math.max(0, Math.min(n, value))
      buffer[i] = value
    }
  } else {
    // Direct method for small n
    for (let i = 0; i < size; i++) {
      let successes = 0
      for (let trial = 0; trial < n; trial++) {
        if (rand() < p) successes++
      }
      buffer[i] = successes
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from Poisson distribution
 * Uses Knuth's algorithm for small lambda, rejection method for large lambda
 */
export function poisson(
  lambda = 1.0,
  shape: number | number[] = 1,
  dtype: DType = 'int32',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  if (lambda < 30) {
    // Knuth's algorithm for small lambda
    const L = Math.exp(-lambda)

    for (let i = 0; i < size; i++) {
      let k = 0
      let p = 1.0

      do {
        k++
        p *= rand()
      } while (p > L)

      buffer[i] = k - 1
    }
  } else {
    // Normal approximation for large lambda
    const mean = lambda
    const stdDev = Math.sqrt(lambda)

    for (let i = 0; i < size; i++) {
      // Box-Muller transform
      const u1 = rand()
      const u2 = rand()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

      let value = Math.round(z * stdDev + mean)
      // Clamp to non-negative
      value = Math.max(0, value)
      buffer[i] = value
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Random samples from gamma distribution
 * Uses Marsaglia and Tsang's method
 */
export function gamma(
  shape_param: number,
  scale = 1.0,
  shape: number | number[] = 1,
  dtype: DType = 'float64',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)
  const k = shape_param

  if (k < 1) {
    // Use shape augmentation for k < 1
    for (let i = 0; i < size; i++) {
      const u = rand()
      const g = gammaHelper(k + 1)
      buffer[i] = g * Math.pow(u, 1 / k) * scale
    }
  } else {
    for (let i = 0; i < size; i++) {
      buffer[i] = gammaHelper(k) * scale
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Helper function for gamma distribution (Marsaglia and Tsang's method)
 */
function gammaHelper(k: number): number {
  const d = k - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let x: number
    let v: number

    do {
      // Generate standard normal
      const u1 = rand()
      const u2 = rand()
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      v = 1 + c * x
    } while (v <= 0)

    v = v * v * v
    const u = rand()

    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v
    }
  }
}

/**
 * Random samples from beta distribution
 * Uses gamma distribution to generate beta samples
 */
export function beta(
  alpha: number,
  betaParam: number,
  shape: number | number[] = 1,
  dtype: DType = 'float64',
): NDArray {
  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)

  const buffer = createTypedArray(size, dtype)

  for (let i = 0; i < size; i++) {
    const x = gammaHelper(alpha)
    const y = gammaHelper(betaParam)
    buffer[i] = x / (x + y)
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Chi-square distribution with k degrees of freedom
 * χ² = sum of k squared standard normal variables
 */
export function chisquare(df: number, shape: number | number[] = 1, dtype: DType = 'float64'): NDArray {
  if (df <= 0) {
    throw new Error('Degrees of freedom must be positive')
  }

  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)
  const buffer = createTypedArray(size, dtype)

  // Chi-square is sum of k squared standard normals
  for (let i = 0; i < size; i++) {
    let sum = 0
    for (let j = 0; j < df; j++) {
      const u1 = rand()
      const u2 = rand()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      sum += z * z
    }
    buffer[i] = sum
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Log-normal distribution
 * If X ~ Normal(mean, sigma), then exp(X) ~ LogNormal
 */
export function lognormal(mean: number = 0, sigma: number = 1, shape: number | number[] = 1, dtype: DType = 'float64'): NDArray {
  if (sigma <= 0) {
    throw new Error('Sigma must be positive')
  }

  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)
  const buffer = createTypedArray(size, dtype)

  // Generate normal samples and exponentiate
  for (let i = 0; i < size; i++) {
    const u1 = rand()
    const u2 = rand()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    buffer[i] = Math.exp(mean + sigma * z)
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Triangular distribution over [left, right] with mode at mode
 */
export function triangular(left: number, mode: number, right: number, shape: number | number[] = 1, dtype: DType = 'float64'): NDArray {
  if (left > mode || mode > right) {
    throw new Error('Must have left <= mode <= right')
  }

  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)
  const buffer = createTypedArray(size, dtype)

  const fc = (mode - left) / (right - left)

  for (let i = 0; i < size; i++) {
    const u = rand()
    if (u < fc) {
      buffer[i] = left + Math.sqrt(u * (right - left) * (mode - left))
    } else {
      buffer[i] = right - Math.sqrt((1 - u) * (right - left) * (right - mode))
    }
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Weibull distribution with shape parameter k and scale parameter λ
 */
export function weibull(k: number, lambda: number = 1, shape: number | number[] = 1, dtype: DType = 'float64'): NDArray {
  if (k <= 0 || lambda <= 0) {
    throw new Error('Shape and scale parameters must be positive')
  }

  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((a, b) => a * b, 1)
  const buffer = createTypedArray(size, dtype)

  for (let i = 0; i < size; i++) {
    const u = rand()
    buffer[i] = lambda * Math.pow(-Math.log(1 - u), 1 / k)
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}

/**
 * Pareto distribution (power law) with shape parameter a
 */
export function pareto(a: number, shape: number | number[] = 1, dtype: DType = 'float64'): NDArray {
  if (a <= 0) {
    throw new Error('Shape parameter must be positive')
  }

  const shapeArray = typeof shape === 'number' ? [shape] : shape
  const size = shapeArray.reduce((acc, b) => acc * b, 1)
  const buffer = createTypedArray(size, dtype)

  for (let i = 0; i < size; i++) {
    const u = rand()
    buffer[i] = Math.pow(1 - u, -1 / a)
  }

  const strides = new Array(shapeArray.length)
  strides[shapeArray.length - 1] = 1
  for (let i = shapeArray.length - 2; i >= 0; i--) {
    strides[i] = strides[i + 1] * shapeArray[i + 1]
  }

  return new NDArray({
    buffer,
    shape: shapeArray,
    strides,
    dtype,
  })
}
