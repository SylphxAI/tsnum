---
"tsnum": minor
---

# tsnum - Advanced NumPy Features

**Scientific computing essentials** - Advanced random distributions and linear algebra!

## New Features

### Random Distributions (7 functions)
Essential probability distributions for statistics and machine learning:
- `uniform(low, high, shape)` - Uniform distribution
- `normal(mean, std, shape)` - Normal/Gaussian distribution
- `exponential(scale, shape)` - Exponential distribution
- `binomial(n, p, shape)` - Binomial distribution
- `poisson(lambda, shape)` - Poisson distribution
- `gamma(shape, scale, size)` - Gamma distribution
- `beta(alpha, beta, shape)` - Beta distribution

All distributions support:
- Configurable parameters
- Multi-dimensional arrays
- Seedable random state
- Efficient algorithms (Box-Muller, Marsaglia-Tsang, etc.)

### Advanced Linear Algebra (4 functions)
Solve complex linear systems and matrix problems:
- `pinv(A, rcond)` - Moore-Penrose pseudoinverse (using SVD)
- `matrix_rank(A, tol)` - Compute matrix rank
- `matrix_power(A, n)` - Raise matrix to integer power
- `lstsq(A, b, rcond)` - Least squares solution

## Breaking Changes

None - pure additions to the API.

## Usage Examples

```typescript
import {
  uniform, normal, exponential, binomial, poisson, gamma, beta,
  pinv, matrix_rank, matrix_power, lstsq,
  setSeed
} from 'tsnum'

// Random distributions
setSeed(42) // Reproducible results

// Uniform distribution [0, 1)
const u = uniform(0, 1, [100])

// Normal distribution (mean=0, std=1)
const n = normal(0, 1, [1000])

// Exponential for waiting times
const waiting = exponential(1.5, [50])

// Binomial for coin flips
const flips = binomial(10, 0.5, [100]) // 10 flips per trial

// Poisson for event counts
const events = poisson(3.5, [50]) // lambda=3.5

// Gamma distribution
const g = gamma(2.0, 2.0, [100])

// Beta distribution
const b = beta(2.0, 5.0, [100])

// Advanced Linear Algebra

// Pseudoinverse for non-square systems
const A = array([[1, 2], [3, 4], [5, 6]]) // 3x2 matrix
const Aplus = pinv(A) // 2x3 pseudoinverse

// Matrix rank
const rank = matrix_rank(A) // 2

// Matrix powers
const B = array([[1, 2], [3, 4]])
const B2 = matrix_power(B, 2) // B^2
const BInv = matrix_power(B, -1) // B^(-1) = inv(B)

// Least squares fitting
const x = array([0, 1, 2, 3])
const y = array([1, 3, 7, 13])
const design = array([[1, 0], [1, 1], [1, 2], [1, 3]])
const { x: coeffs, residuals, rank: r } = lstsq(design, y)
// Fit y = a + b*x, returns [a, b]
```

No changes needed to existing code!
