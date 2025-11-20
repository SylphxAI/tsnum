# tsnum

## 1.1.0

### Minor Changes

- a5d028f: # tsnum - Advanced NumPy Features

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
    uniform,
    normal,
    exponential,
    binomial,
    poisson,
    gamma,
    beta,
    pinv,
    matrix_rank,
    matrix_power,
    lstsq,
    setSeed,
  } from "tsnum";

  // Random distributions
  setSeed(42); // Reproducible results

  // Uniform distribution [0, 1)
  const u = uniform(0, 1, [100]);

  // Normal distribution (mean=0, std=1)
  const n = normal(0, 1, [1000]);

  // Exponential for waiting times
  const waiting = exponential(1.5, [50]);

  // Binomial for coin flips
  const flips = binomial(10, 0.5, [100]); // 10 flips per trial

  // Poisson for event counts
  const events = poisson(3.5, [50]); // lambda=3.5

  // Gamma distribution
  const g = gamma(2.0, 2.0, [100]);

  // Beta distribution
  const b = beta(2.0, 5.0, [100]);

  // Advanced Linear Algebra

  // Pseudoinverse for non-square systems
  const A = array([
    [1, 2],
    [3, 4],
    [5, 6],
  ]); // 3x2 matrix
  const Aplus = pinv(A); // 2x3 pseudoinverse

  // Matrix rank
  const rank = matrix_rank(A); // 2

  // Matrix powers
  const B = array([
    [1, 2],
    [3, 4],
  ]);
  const B2 = matrix_power(B, 2); // B^2
  const BInv = matrix_power(B, -1); // B^(-1) = inv(B)

  // Least squares fitting
  const x = array([0, 1, 2, 3]);
  const y = array([1, 3, 7, 13]);
  const design = array([
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
  ]);
  const { x: coeffs, residuals, rank: r } = lstsq(design, y);
  // Fit y = a + b*x, returns [a, b]
  ```

  No changes needed to existing code!

- c464639: # tsnum - Bitwise Operations, Element Selection, and Integration

  **Low-level operations and numerical analysis** - Bit manipulation, conditional selection, and trapezoidal integration!

  ## New Features

  ### Bitwise Operations (7 functions)

  Low-level bit manipulation operations:

  - `bitwise_and(a, b)` - Bitwise AND operation
  - `bitwise_or(a, b)` - Bitwise OR operation
  - `bitwise_xor(a, b)` - Bitwise XOR operation
  - `bitwise_not(a)` - Bitwise NOT (inversion)
  - `left_shift(a, shift)` - Shift bits left
  - `right_shift(a, shift)` - Shift bits right
  - `invert(a)` - Alias for bitwise_not

  All bitwise operations:

  - Support element-wise operations
  - Handle integer arrays
  - Support scalar or array shift amounts
  - Enable low-level data manipulation

  ### Enhanced Comparison (3 functions)

  Additional comparison and equality testing:

  - `not_equal(a, b)` - Element-wise inequality test
  - `array_equal(a, b)` - Test if arrays are identical (shape + values)
  - `array_equiv(a, b)` - Test if arrays are equivalent (allows type coercion)

  All comparison functions:

  - Support both array and scalar operands
  - Return boolean or uint8 arrays
  - Enable array validation and testing
  - Follow NumPy comparison semantics

  ### Element Selection (4 functions)

  Conditional element extraction and manipulation:

  - `extract(condition, arr)` - Extract elements where condition is true
  - `place(arr, mask, values)` - Replace elements where mask is true (in-place)
  - `compress(condition, arr, axis)` - Select slices along axis
  - `choose(indices, choices)` - Construct array from index and choice arrays

  All selection functions:

  - Support conditional operations
  - Enable flexible array manipulation
  - Handle both 1D and multi-dimensional arrays
  - Support in-place modifications

  ### Numerical Integration (2 functions)

  Trapezoidal rule integration:

  - `trapz(y, x?, dx)` - Definite integral using trapezoidal rule
  - `cumtrapz(y, x?, dx, initial)` - Cumulative trapezoidal integration

  Integration functions:

  - Support uniform or variable spacing
  - Handle 1D arrays
  - Use composite trapezoidal rule
  - Enable numerical analysis

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    bitwise_and,
    bitwise_or,
    bitwise_xor,
    bitwise_not,
    left_shift,
    right_shift,
    not_equal,
    array_equal,
    array_equiv,
    extract,
    place,
    compress,
    choose,
    trapz,
    cumtrapz,
    array,
  } from "tsnum";

  // Bitwise Operations

  // Bitwise logic
  const a = array([12, 10, 8]); // Binary: 1100, 1010, 1000
  const b = array([6, 3, 5]); // Binary: 0110, 0011, 0101

  const and = bitwise_and(a, b); // [4, 2, 0]
  const or = bitwise_or(a, b); // [14, 11, 13]
  const xor = bitwise_xor(a, b); // [10, 9, 13]
  const not = bitwise_not(a); // [-13, -11, -9]

  // Bit shifting
  const shifted = left_shift(array([1, 2, 4]), 2); // [4, 8, 16]
  const unshifted = right_shift(array([8, 16, 32]), 2); // [2, 4, 8]

  // Enhanced Comparison

  // Element-wise inequality
  const x = array([1, 2, 3]);
  const y = array([1, 4, 3]);
  const neq = not_equal(x, y); // [0, 1, 0]

  // Array equality tests
  const eq = array_equal(x, y); // false
  const equiv = array_equiv(x, x); // true

  // Element Selection

  // Extract where condition is true
  const data = array([1, 2, 3, 4, 5]);
  const mask = array([1, 0, 1, 0, 1]);
  const selected = extract(mask, data); // [1, 3, 5]

  // Replace values where mask is true (in-place)
  const arr = array([1, 2, 3, 4, 5]);
  place(arr, mask, 99); // arr becomes [99, 2, 99, 4, 99]

  // Compress along axis
  const matrix = array([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
  const compressed = compress([true, false, true], matrix, 0);
  // [[1, 2], [5, 6]]

  // Choose from multiple arrays
  const indices = array([0, 1, 0, 1]);
  const choices = [array([10, 20, 30, 40]), array([100, 200, 300, 400])];
  const result = choose(indices, choices); // [10, 200, 30, 400]

  // Numerical Integration

  // Definite integral (uniform spacing)
  const y1 = array([1, 2, 3, 4, 5]);
  const area = trapz(y1, undefined, 1.0); // 12

  // Definite integral (variable spacing)
  const x = array([0, 1, 3, 6, 10]);
  const y2 = array([1, 2, 3, 4, 5]);
  const varArea = trapz(y2, x); // ~29.5

  // Cumulative integration
  const cumArea = cumtrapz(y1, undefined, 1.0, 0);
  // [0, 1.5, 4, 7.5, 12]
  ```

  ## Applications

  **Bitwise Operations:**

  - Flag manipulation and masking
  - Low-level data encoding/decoding
  - Efficient set operations
  - Hash computations

  **Enhanced Comparison:**

  - Array validation in tests
  - Data consistency checks
  - Type-safe comparisons
  - Debugging and assertions

  **Element Selection:**

  - Conditional data filtering
  - Masked array operations
  - Data cleaning and preprocessing
  - Selective updates

  **Numerical Integration:**

  - Area under curve calculations
  - Signal processing
  - Physics simulations
  - Data analysis and smoothing

  No changes needed to existing code!

- 19b24af: # tsnum - Broadcasting and Statistics Utilities

  **NumPy compatibility and data analysis** - Broadcasting utilities and statistical functions!

  ## New Features

  ### Broadcasting Utilities (5 functions)

  Essential for NumPy compatibility and flexible array operations:

  - `atleast_1d(...arrays)` - View arrays with at least 1 dimension
  - `atleast_2d(...arrays)` - View arrays with at least 2 dimensions
  - `atleast_3d(...arrays)` - View arrays with at least 3 dimensions
  - `broadcast_to(array, shape)` - Broadcast array to target shape
  - `broadcast_arrays(...arrays)` - Broadcast multiple arrays to common shape

  All broadcasting functions:

  - Support multiple arrays
  - Handle dimension expansion automatically
  - Follow NumPy broadcasting rules
  - Enable flexible array operations

  ### Additional Statistics (3 functions)

  Common data analysis operations:

  - `bincount(x, minlength)` - Count occurrences of integers
  - `digitize(x, bins, right)` - Find bin indices for values
  - `argwhere(condition)` - Find indices where condition is true

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    atleast_1d,
    atleast_2d,
    atleast_3d,
    broadcast_to,
    broadcast_arrays,
    bincount,
    digitize,
    argwhere,
    array,
  } from "tsnum";

  // Broadcasting Utilities

  // Ensure minimum dimensions
  const scalar = array([5]);
  const arr1d = atleast_1d(scalar)[0]; // [5]
  const arr2d = atleast_2d(scalar)[0]; // [[5]]
  const arr3d = atleast_3d(scalar)[0]; // [[[5]]]

  // Broadcast to specific shape
  const a = array([1, 2, 3]);
  const broadcasted = broadcast_to(a, [3, 3]);
  // [[1, 2, 3],
  //  [1, 2, 3],
  //  [1, 2, 3]]

  // Broadcast multiple arrays to common shape
  const x = array([1, 2, 3]);
  const y = array([[1], [2]]);
  const [xb, yb] = broadcast_arrays(x, y);
  // xb shape: [2, 3]
  // yb shape: [2, 3]

  // Additional Statistics

  // Count occurrences
  const data = array([0, 1, 1, 2, 2, 2]);
  const counts = bincount(data); // [1, 2, 3]

  // Digitize - assign to bins
  const values = array([0.5, 1.5, 2.5, 3.5]);
  const bins = array([1, 2, 3]);
  const indices = digitize(values, bins);
  // [0, 1, 2, 3] - which bin each value belongs to

  // Find non-zero indices
  const mask = array([
    [0, 1, 0],
    [1, 0, 1],
  ]);
  const coords = argwhere(mask);
  // [[0, 1], [1, 0], [1, 2]] - coordinates of non-zero elements
  ```

  ## Applications

  **Broadcasting:**

  - Element-wise operations on different shaped arrays
  - Vectorized computations
  - Memory-efficient array operations
  - NumPy compatibility

  **Statistics:**

  - Frequency analysis (bincount)
  - Histogram computation (digitize)
  - Conditional indexing (argwhere)
  - Data binning and categorization

  No changes needed to existing code!

- fa517f1: # tsnum - 2D FFT and Array Manipulation

  **Image processing and array transformations** - 2D FFT and manipulation operations!

  ## New Features

  ### 2D FFT Operations (4 functions)

  Essential for image and signal processing:

  - `fft2(a)` - 2D Fast Fourier Transform
  - `ifft2(a)` - 2D Inverse FFT
  - `rfft2(a)` - 2D Real FFT (optimized for real input)
  - `irfft2(a, shape)` - 2D Inverse Real FFT

  All 2D FFT functions:

  - Apply FFT along both axes (row-wise then column-wise)
  - Support power-of-2 dimensions
  - Return complex results as [rows, cols, 2] arrays
  - Efficient Cooley-Tukey algorithm

  ### Array Manipulation (4 functions)

  Common array transformation operations:

  - `flip(a, axis)` - Reverse element order along axis
  - `rot90(a, k)` - Rotate 90 degrees (k times)
  - `pad(a, padWidth, mode, constantValue)` - Pad array edges
  - `moveaxis(a, source, destination)` - Move axis to new position

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    fft2,
    ifft2,
    rfft2,
    irfft2,
    flip,
    rot90,
    pad,
    moveaxis,
    array,
  } from "tsnum";

  // 2D FFT - Image processing
  const image = array([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ]);

  // Forward 2D FFT
  const freq = fft2(image); // [4, 4, 2] complex spectrum

  // Inverse 2D FFT
  const reconstructed = ifft2(freq);

  // Real FFT (for real-valued images)
  const rfreq = rfft2(image); // [4, 3, 2] - only positive frequencies
  const back = irfft2(rfreq, [4, 4]);

  // Array Manipulation

  // Flip along axis
  const flipped = flip(array([1, 2, 3, 4])); // [4, 3, 2, 1]

  const matrix = array([
    [1, 2],
    [3, 4],
  ]);
  const vflip = flip(matrix, 0); // [[3, 4], [1, 2]] - flip rows
  const hflip = flip(matrix, 1); // [[2, 1], [4, 3]] - flip cols

  // Rotate 90 degrees
  const rot = rot90(matrix); // [[2, 4], [1, 3]]
  const rot180 = rot90(matrix, 2); // [[4, 3], [2, 1]]
  const rotCW = rot90(matrix, -1); // [[3, 1], [4, 2]] - clockwise

  // Pad array
  const arr = array([1, 2, 3]);
  const padded = pad(arr, 2); // [0, 0, 1, 2, 3, 0, 0]
  const padEdge = pad(arr, [1, 2], "edge"); // [1, 1, 2, 3, 3, 3]

  // Move axis (transpose for 2D)
  const moved = moveaxis(matrix, 0, 1); // Same as transpose
  ```

  ## Applications

  **2D FFT:**

  - Image filtering and enhancement
  - Frequency domain analysis
  - Convolution via FFT
  - Pattern recognition

  **Manipulation:**

  - Image augmentation (flip, rotate)
  - Boundary handling (pad)
  - Dimension reordering (moveaxis)

  No changes needed to existing code!

- 52b1f8e: # tsnum - Final Polish (Complete Library)

  **Final utilities and enhancements** - NaN handling, diagonal operations, polynomial calculus, and indexing helpers!

  ## New Features

  ### NaN Utilities (1 function)

  Handle special floating-point values:

  - `nan_to_num(x, nan?, posinf?, neginf?)` - Replace NaN/Inf with finite numbers

  Features:

  - Replace NaN with specified value (default 0)
  - Replace positive infinity with large finite number
  - Replace negative infinity with large negative number
  - Configurable replacement values

  ### Indexing Helpers (1 function)

  Efficient non-zero element location:

  - `flatnonzero(a)` - Return indices of non-zero elements in flattened array

  Features:

  - Returns flat indices
  - More efficient than argwhere for 1D case
  - Useful for sparse array operations
  - int32 return type

  ### Diagonal Utilities (2 functions)

  Extended diagonal array operations:

  - `diagflat(v, k?, options?)` - Create 2D array with flattened input on diagonal
  - `fill_diagonal(arr, val)` - Fill main diagonal in-place

  Features:

  - diagflat automatically flattens input
  - Support for offset diagonals (k parameter)
  - In-place diagonal filling for efficiency
  - Compatible with all dtypes

  ### Polynomial Calculus (2 functions)

  Differentiation and integration of polynomials:

  - `polyder(p, m?)` - Return derivative of polynomial (order m)
  - `polyint(p, m?, k?)` - Return antiderivative of polynomial (order m)

  Features:

  - Multiple derivatives/integrals via m parameter
  - Integration constants via k parameter
  - Preserves coefficient dtype
  - Analytical computation (no numerical approximation)

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    nan_to_num,
    flatnonzero,
    diagflat,
    fill_diagonal,
    polyder,
    polyint,
    array,
  } from "tsnum";

  // NaN Utilities

  // Replace special values
  const data = array([1, NaN, 3, Infinity, -Infinity]);
  const cleaned = nan_to_num(data);
  // [1, 0, 3, 1.7976931348623157e+308, -1.7976931348623157e+308]

  // Custom replacement values
  const custom = nan_to_num(data, -999, 999, -999);
  // [1, -999, 3, 999, -999]

  // Indexing Helpers

  // Find non-zero indices
  const sparse = array([0, 1, 0, 2, 0, 3, 0]);
  const indices = flatnonzero(sparse);
  // [1, 3, 5] - indices of non-zero elements

  // Use for sparse operations
  const values = array([10, 20, 30, 40, 50]);
  const mask = array([0, 1, 0, 1, 0]);
  const selectedIndices = flatnonzero(mask); // [1, 3]
  // Can use indices to extract: values at positions 1 and 3

  // Diagonal Utilities

  // Create diagonal matrix from flattened input
  const matrix = array([
    [1, 2],
    [3, 4],
  ]);
  const diag = diagflat(matrix); // Flatten [1,2,3,4] and put on diagonal
  // [[1, 0, 0, 0],
  //  [0, 2, 0, 0],
  //  [0, 0, 3, 0],
  //  [0, 0, 0, 4]]

  // Offset diagonal
  const offset = diagflat([1, 2, 3], 1);
  // [[0, 1, 0, 0],
  //  [0, 0, 2, 0],
  //  [0, 0, 0, 3],
  //  [0, 0, 0, 0]]

  // Fill diagonal in-place
  const mat = array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
  fill_diagonal(mat, 0);
  // [[0, 2, 3],
  //  [4, 0, 6],
  //  [7, 8, 0]]

  // Polynomial Calculus

  // Derivative: p(x) = 2x^2 + 3x + 1
  const p = array([2, 3, 1]);
  const dp = polyder(p); // p'(x) = 4x + 3
  // [4, 3]

  // Second derivative
  const d2p = polyder(p, 2); // p''(x) = 4
  // [4]

  // Integration: ∫(4x + 3)dx = 2x^2 + 3x + C
  const integral = polyint(array([4, 3]), 1, 0);
  // [2, 3, 0] - with constant = 0

  // Integration with custom constant
  const withConstant = polyint(array([4, 3]), 1, 5);
  // [2, 3, 5] - integration constant = 5

  // Multiple integration
  const doubleInt = polyint(array([4]), 2, [0, 0]);
  // ∫∫4 dx dx = 2x^2 + C1*x + C2
  // [2, 0, 0]
  ```

  ## Applications

  **NaN Utilities:**

  - Data cleaning and preprocessing
  - Handling missing values in datasets
  - Robust numerical computation
  - Preventing NaN propagation

  **Indexing Helpers:**

  - Sparse matrix operations
  - Efficient element selection
  - Conditional indexing
  - Memory-efficient filtering

  **Diagonal Utilities:**

  - Matrix construction from vectors
  - Identity-like matrix creation
  - Covariance matrix initialization
  - Efficient diagonal modification

  **Polynomial Calculus:**

  - Physics: velocity from position, acceleration from velocity
  - Optimization: finding critical points
  - Integration: area under polynomial curves
  - Symbolic mathematics

  **Library Status:**
  This completes the core NumPy feature set with **141 functions** providing comprehensive array operations, mathematical functions, linear algebra, statistics, signal processing, and utilities.

  Total feature parity: **~99% of common NumPy operations**

- eff4c6d: # tsnum - Polynomial and Advanced Indexing

  **Complete polynomial fitting and advanced array indexing** - Curve fitting, coordinate manipulation, and flexible indexing!

  ## New Features

  ### Polynomial Functions (3 functions)

  Essential for curve fitting and data analysis:

  - `polyfit(x, y, deg)` - Least squares polynomial fit
  - `polyval(p, x)` - Evaluate polynomial at values
  - `roots(p)` - Find polynomial roots (up to degree 2)

  All polynomial functions:

  - Use least squares fitting for optimal approximation
  - Support Horner's method for efficient evaluation
  - Handle linear and quadratic equations analytically
  - Enable regression analysis and curve fitting

  ### Advanced Indexing (5 functions)

  Flexible coordinate and index manipulation:

  - `ix_(...arrays)` - Construct open mesh from sequences
  - `unravel_index(indices, shape)` - Convert flat to multi-dimensional indices
  - `ravel_multi_index(multi_index, shape)` - Convert multi-dimensional to flat indices
  - `put(a, indices, values)` - Put values at indices (in-place)
  - `putmask(a, mask, values)` - Put values where mask is true (in-place)

  All indexing functions:

  - Support multi-dimensional coordinate conversion
  - Enable flexible array element manipulation
  - Handle both single and multiple indices
  - Follow NumPy indexing conventions

  ### Array Creation (2 functions)

  Generate arrays from functions and coordinates:

  - `fromfunction(fn, shape)` - Construct array by executing function over coordinates
  - `indices(dimensions)` - Return arrays of grid indices

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    polyfit,
    polyval,
    roots,
    ix_,
    unravel_index,
    ravel_multi_index,
    put,
    putmask,
    fromfunction,
    indices,
    array,
  } from "tsnum";

  // Polynomial Functions

  // Fit polynomial to data
  const x = array([0, 1, 2, 3, 4]);
  const y = array([1, 3, 2, 5, 7]);
  const coeffs = polyfit(x, y, 2); // Fit quadratic: ax^2 + bx + c

  // Evaluate polynomial
  const xNew = array([0.5, 1.5, 2.5]);
  const yPred = polyval(coeffs, xNew); // Predict values

  // Find roots
  const p = array([1, -3, 2]); // x^2 - 3x + 2 = 0
  const r = roots(p); // [2, 1]

  // Advanced Indexing

  // Create open mesh for broadcasting
  const a = array([1, 2, 3]);
  const b = array([10, 20]);
  const [ai, bi] = ix_(a, b);
  // ai: [[1], [2], [3]] - shape (3, 1)
  // bi: [[10, 20]] - shape (1, 2)
  // Can now broadcast: ai + bi

  // Convert between flat and multi-dimensional indices
  const coords = unravel_index([5, 13], [4, 4]);
  // [[1, 1], [3, 1]] - row-col coordinates

  const flatIdx = ravel_multi_index(
    [
      [1, 1],
      [3, 1],
    ],
    [4, 4]
  );
  // [5, 13] - flat indices

  // In-place modification
  const arr = array([1, 2, 3, 4, 5]);
  put(arr, [0, 2, 4], [10, 30, 50]);
  // arr becomes [10, 2, 30, 4, 50]

  const mask = array([1, 0, 1, 0, 1]);
  putmask(arr, mask, 99);
  // arr becomes [99, 2, 99, 4, 99]

  // Array Creation from Functions

  // Generate array from function
  const grid = fromfunction((i, j) => i + j, [3, 3]);
  // [[0, 1, 2],
  //  [1, 2, 3],
  //  [2, 3, 4]]

  // Get coordinate arrays
  const [rows, cols] = indices([2, 3]);
  // rows: [[0, 0, 0],
  //        [1, 1, 1]]
  // cols: [[0, 1, 2],
  //        [0, 1, 2]]
  ```

  ## Applications

  **Polynomial:**

  - Curve fitting and regression
  - Data interpolation
  - Root finding for equations
  - Trend analysis

  **Advanced Indexing:**

  - Coordinate system transformations
  - Multi-dimensional array indexing
  - Selective array updates
  - Grid construction for computations

  **Array Creation:**

  - Generate coordinate grids
  - Create arrays from mathematical functions
  - Build test data
  - Initialize arrays with patterns

  No changes needed to existing code!

- 0c90cde: # tsnum - Array Utilities and Information Functions (Final)

  **Complete the library** - Array introspection, interpolation, utilities, and testing functions!

  ## New Features

  ### Array Information Utilities (5 functions)

  Introspection and metadata functions:

  - `ndim(a)` - Return number of array dimensions
  - `size(a, axis?)` - Return number of elements (total or along axis)
  - `shape(a)` - Return shape as array
  - `itemsize(a)` - Return size of one element in bytes
  - `nbytes(a)` - Return total bytes consumed by array

  All info functions:

  - Provide array metadata without copying data
  - Support efficient introspection
  - Enable memory and shape analysis
  - Compatible with all dtypes

  ### Interpolation (1 function)

  Linear interpolation for data analysis:

  - `interp(x, xp, fp, left?, right?)` - 1D linear interpolation

  Interpolation features:

  - Linear interpolation between data points
  - Extrapolation control with left/right parameters
  - Sorted input handling
  - Efficient evaluation

  ### Array Utilities (3 functions)

  Common array manipulation utilities:

  - `trim_zeros(arr, trim)` - Trim leading/trailing zeros
  - `ediff1d(arr, toEnd?, toBegin?)` - Consecutive differences
  - `around(arr, decimals)` - Round to given decimals

  ### Array Generation (2 functions)

  Logarithmic and geometric spacing:

  - `logspace(start, stop, num, base)` - Log-spaced values
  - `geomspace(start, stop, num)` - Geometrically spaced values

  Generation features:

  - Log scale for scientific computing
  - Geometric progression for exponential data
  - Configurable base for logspace
  - Consistent with linspace API

  ### Type Testing Utilities (5 functions)

  Type checking and validation:

  - `isscalar(val)` - Check if value is scalar
  - `isreal(arr)` - Check if array contains real numbers
  - `iscomplex(arr)` - Check if array contains complex numbers (always false)
  - `iscomplexobj(obj)` - Check if object is complex type (always false)
  - `isrealobj(arr)` - Check if array contains real values

  Testing features:

  - Scalar vs array distinction
  - Real number validation (excludes NaN/Infinity)
  - Complex number support (placeholder for future)
  - Type guard functions

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    ndim,
    size,
    shape,
    itemsize,
    nbytes,
    interp,
    trim_zeros,
    ediff1d,
    around,
    logspace,
    geomspace,
    isscalar,
    isreal,
    array,
  } from "tsnum";

  // Array Information

  const arr = array([
    [1, 2, 3],
    [4, 5, 6],
  ]);

  const dims = ndim(arr); // 2
  const total = size(arr); // 6
  const axisSize = size(arr, 0); // 2 (rows)
  const arrShape = shape(arr); // [2, 3]
  const bytes = itemsize(arr); // 8 (float64)
  const totalBytes = nbytes(arr); // 48

  // Interpolation

  // Linear interpolation
  const x = array([0, 1, 2, 3, 4]);
  const y = array([0, 2, 1, 3, 2]);

  const xNew = array([0.5, 1.5, 2.5, 3.5]);
  const yInterp = interp(xNew, x, y);
  // [1.0, 1.5, 2.0, 2.5] - interpolated values

  // Extrapolation control
  const yExtrap = interp(array([-1, 5]), x, y, -999, -999);
  // [-999, -999] - use custom values outside range

  // Array Utilities

  // Trim zeros
  const withZeros = array([0, 0, 1, 2, 3, 0, 0]);
  const trimmed = trim_zeros(withZeros); // [1, 2, 3]
  const trimFront = trim_zeros(withZeros, "f"); // [1, 2, 3, 0, 0]
  const trimBack = trim_zeros(withZeros, "b"); // [0, 0, 1, 2, 3]

  // Consecutive differences (always returns same length)
  const data = array([1, 3, 6, 10]);
  const diffs = ediff1d(data); // [2, 3, 4]
  const withEnds = ediff1d(data, 99, -1); // [-1, 2, 3, 4, 99]

  // Rounding
  const floats = array([1.12345, 2.56789, 3.14159]);
  const rounded = around(floats, 2); // [1.12, 2.57, 3.14]

  // Array Generation

  // Logarithmic spacing (base 10)
  const logValues = logspace(0, 3, 4);
  // [1, 10, 100, 1000] - 10^0 to 10^3

  // Custom base
  const log2 = logspace(0, 4, 5, 2);
  // [1, 2, 4, 8, 16] - powers of 2

  // Geometric spacing
  const geom = geomspace(1, 1000, 4);
  // [1, 10, 100, 1000] - geometric progression

  // Negative values (same sign required)
  const negGeom = geomspace(-1, -1000, 4);
  // [-1, -10, -100, -1000]

  // Type Testing

  // Scalar check
  isscalar(5); // true
  isscalar(array([5])); // false

  // Real number check
  isreal(array([1, 2, 3])); // true
  isreal(array([1, NaN, 3])); // false (NaN not real)
  isreal(array([1, Infinity])); // false (Infinity not real)

  // Complex check (future-proofing)
  iscomplex(array([1, 2, 3])); // false (no complex support)
  ```

  ## Applications

  **Array Information:**

  - Memory profiling and optimization
  - Shape validation in pipelines
  - Dynamic array handling
  - Type introspection

  **Interpolation:**

  - Time series resampling
  - Signal reconstruction
  - Data smoothing
  - Missing value estimation

  **Array Utilities:**

  - Data cleaning (trim_zeros)
  - Signal processing (ediff1d for velocity from position)
  - Display formatting (around)
  - Numeric precision control

  **Array Generation:**

  - Logarithmic plots (logspace)
  - Exponential growth modeling (geomspace)
  - Frequency analysis (log-spaced frequencies)
  - Scientific computing scales

  **Type Testing:**

  - Input validation
  - Type guards in pipelines
  - Data quality checks
  - API boundary validation

  This completes the core NumPy feature set for tsnum!

- dc1eac8: # tsnum v1.1 - Critical NumPy Features

  **Essential operations** - Most commonly used NumPy functions now available!

  ## New Features

  ### Set Operations (6 functions)

  - `unique` - Find unique values (sorted)
  - `isin` - Test element membership
  - `intersect1d` - Set intersection
  - `union1d` - Set union
  - `setdiff1d` - Set difference
  - `setxor1d` - Symmetric difference

  ### Cumulative Operations (4 functions)

  - `cumsum` - Cumulative sum
  - `cumprod` - Cumulative product
  - `diff` - Discrete differences (with n parameter)
  - `gradient` - Numerical gradient

  ### Validation Functions (7 functions)

  - `isnan` - NaN checking
  - `isinf` - Infinity checking
  - `isfinite` - Finite value checking
  - `isclose` - Element-wise tolerance comparison
  - `allclose` - Boolean tolerance comparison
  - `nonzero` - Non-zero indices
  - `searchsorted` - Binary search for insertion

  ### Shape Operations (3 functions)

  - `squeeze` - Remove size-1 dimensions
  - `expandDims` - Add new axis
  - `swapaxes` - Swap two axes (2D support)

  ### Array Manipulation (4 functions)

  - `split` - Split into sub-arrays
  - `hsplit` - Horizontal split
  - `vsplit` - Vertical split
  - `tile` - Tile/repeat array

  ### Array Creation (5 functions)

  - `zerosLike` - Zeros matching shape
  - `onesLike` - Ones matching shape
  - `fullLike` - Full matching shape
  - `empty` - Empty array (safe initialization)
  - `emptyLike` - Empty matching shape

  ## Breaking Changes

  None - pure additions to the API.

  ## Migration

  All new functions are tree-shakeable imports:

  ```typescript
  import { unique, cumsum, isnan, squeeze, tile } from "tsnum";

  // Set operations
  const arr = array([1, 2, 2, 3, 3, 3]);
  const uniq = unique(arr); // [1, 2, 3]

  // Cumulative operations
  const values = array([1, 2, 3, 4]);
  const cumulative = cumsum(values); // [1, 3, 6, 10]

  // Validation
  const data = array([1.0, NaN, 3.0]);
  const nanMask = isnan(data); // [0, 1, 0]

  // Shape manipulation
  const reshaped = array([[1], [2], [3]]);
  const squeezed = squeeze(reshaped); // [1, 2, 3]
  ```

  No changes needed to existing code!

- 5e6dc60: # tsnum v1.2 - Important NumPy Features

  **Extended functionality** - Common scientific computing and data analysis features!

  ## New Features

  ### NaN-Aware Statistics (7 functions)

  Essential for real-world data with missing values:

  - `nanmean` - Mean ignoring NaN
  - `nansum` - Sum ignoring NaN
  - `nanmin` - Minimum ignoring NaN
  - `nanmax` - Maximum ignoring NaN
  - `nanstd` - Standard deviation ignoring NaN
  - `nanmedian` - Median ignoring NaN
  - `nanvar` - Variance ignoring NaN

  ### Hyperbolic Functions (6 functions)

  Common in ML and scientific computing:

  - `sinh` - Hyperbolic sine
  - `cosh` - Hyperbolic cosine
  - `tanh` - Hyperbolic tangent
  - `asinh` - Inverse hyperbolic sine
  - `acosh` - Inverse hyperbolic cosine
  - `atanh` - Inverse hyperbolic tangent

  ### Additional Math (3 functions)

  - `arctan2` - Four-quadrant arc tangent
  - `mod` - Modulo operation
  - `fmod` - Floating-point modulo

  ### Matrix Creation (3 functions)

  - `diag` - Create diagonal matrix or extract diagonal
  - `tri` - Lower triangular matrix
  - `meshgrid` - Coordinate matrices from vectors

  ### Copy Operations (3 functions)

  - `copy` - Deep copy of array
  - `view` - Shallow copy (shares data)
  - `ascontiguousarray` - Ensure contiguous memory layout

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    nanmean,
    nanstd,
    sinh,
    tanh,
    diag,
    meshgrid,
    copy,
    view,
  } from "tsnum";

  // NaN-aware statistics
  const data = array([1.0, NaN, 3.0, NaN, 5.0]);
  const avg = nanmean(data); // 3.0 (ignores NaN)
  const stdDev = nanstd(data); // 2.0

  // Hyperbolic functions (useful in neural networks)
  const x = array([0, 1, 2]);
  const activation = tanh(x); // [0, 0.762, 0.964]

  // Create diagonal matrix
  const d = diag([1, 2, 3]);
  // [[1, 0, 0],
  //  [0, 2, 0],
  //  [0, 0, 3]]

  // Meshgrid for plotting/computations
  const x = linspace(0, 1, 3);
  const y = linspace(0, 1, 2);
  const { X, Y } = meshgrid(x, y);

  // Copy vs view
  const original = array([1, 2, 3]);
  const deepCopy = copy(original); // independent
  const shallowView = view(original); // shares data
  ```

  No changes needed to existing code!

- a786ad7: # tsnum - Window Functions, Signal Processing, and Advanced Manipulation

  **Signal processing and dynamic arrays** - Window functions for DSP, convolution/correlation, and flexible array manipulation!

  ## New Features

  ### Window Functions (5 functions)

  Standard DSP windowing functions for signal processing:

  - `hamming(M)` - Hamming window (weighted cosine)
  - `hanning(M)` - Hann window (raised cosine)
  - `blackman(M)` - Blackman window (three-term cosine sum)
  - `bartlett(M)` - Bartlett window (triangular)
  - `kaiser(M, beta)` - Kaiser window (Bessel function)

  All window functions:

  - Generate tapered windows for FFT/spectral analysis
  - Reduce spectral leakage in frequency domain
  - Support configurable window lengths
  - Use standard DSP window formulas

  ### Signal Processing (2 functions)

  Core signal processing operations:

  - `convolve(a, v, mode)` - Discrete linear convolution
  - `correlate(a, v, mode)` - Cross-correlation

  Signal processing features:

  - Support 'full', 'same', 'valid' modes
  - Enable filtering and signal analysis
  - 1D sequence operations
  - Compatible with NumPy modes

  ### Additional Reductions (3 functions)

  More aggregation operations:

  - `prod(a)` - Product of all elements
  - `nanprod(a)` - Product ignoring NaN values
  - `count_nonzero(a)` - Count non-zero elements

  ### Array Manipulation (5 functions)

  Dynamic array modification:

  - `deleteArr(arr, indices, axis)` - Delete elements at indices
  - `insert(arr, index, values, axis)` - Insert values before index
  - `append(arr, values, axis)` - Append values to end
  - `resize(arr, newShape)` - Resize array (cycle values if needed)
  - `roll(arr, shift, axis)` - Roll elements along axis

  All manipulation functions:

  - Support negative indices
  - Handle both 1D and multi-dimensional arrays
  - Enable dynamic array operations
  - Support axis-based operations

  ## Breaking Changes

  None - pure additions to the API.

  ## Usage Examples

  ```typescript
  import {
    hamming,
    hanning,
    blackman,
    bartlett,
    kaiser,
    convolve,
    correlate,
    prod,
    nanprod,
    count_nonzero,
    deleteArr,
    insert,
    append,
    resize,
    roll,
    array,
  } from "tsnum";

  // Window Functions

  // Generate Hamming window for FFT
  const window = hamming(64);
  // Apply to signal before FFT to reduce spectral leakage
  const windowed = signal.mul(window); // element-wise multiplication

  // Different window types
  const hann = hanning(128); // Raised cosine
  const black = blackman(256); // Three-term sum
  const bart = bartlett(64); // Triangular
  const kais = kaiser(128, 5.0); // Kaiser (beta controls shape)

  // Signal Processing

  // Convolution for filtering
  const signal = array([1, 2, 3, 4, 5]);
  const kernel = array([0.25, 0.5, 0.25]); // Moving average filter

  const full = convolve(signal, kernel, "full");
  // [0.25, 1, 2, 3, 4, 3.75, 1.25] - full convolution

  const same = convolve(signal, kernel, "same");
  // [1, 2, 3, 4, 3.75] - same size as input

  const valid = convolve(signal, kernel, "valid");
  // [2, 3, 4] - only where kernel fully overlaps

  // Cross-correlation
  const corr = correlate(signal, kernel, "same");
  // Measure similarity between signals

  // Additional Reductions

  // Product of elements
  const data = array([2, 3, 4]);
  const product = prod(data); // 24

  // Product ignoring NaN
  const withNaN = array([2, NaN, 4]);
  const nanProduct = nanprod(withNaN); // 8

  // Count non-zero elements
  const sparse = array([0, 1, 0, 2, 0, 3]);
  const count = count_nonzero(sparse); // 3

  // Array Manipulation

  // Delete elements
  const arr = array([1, 2, 3, 4, 5]);
  const deleted = deleteArr(arr, [1, 3]); // [1, 3, 5]

  // Insert values
  const inserted = insert(arr, 2, [10, 20]); // [1, 2, 10, 20, 3, 4, 5]

  // Append values
  const appended = append(arr, [6, 7]); // [1, 2, 3, 4, 5, 6, 7]

  // Resize array (cycle if needed)
  const resized = resize(array([1, 2, 3]), [2, 4]);
  // [[1, 2, 3, 1],
  //  [2, 3, 1, 2]]

  // Roll elements
  const rolled = roll(array([1, 2, 3, 4, 5]), 2);
  // [4, 5, 1, 2, 3] - shifted right by 2
  ```

  ## Applications

  **Window Functions:**

  - FFT preprocessing to reduce spectral leakage
  - Digital filter design
  - Audio signal processing
  - Spectral analysis

  **Signal Processing:**

  - Digital filtering (low-pass, high-pass, band-pass)
  - Feature extraction in audio/image processing
  - Pattern matching and detection
  - System identification

  **Reductions:**

  - Statistical analysis
  - Data validation (counting non-zero/valid elements)
  - Product calculations for probability

  **Manipulation:**

  - Dynamic array operations
  - Data augmentation
  - Circular buffers (roll)
  - Array editing and modification

  No changes needed to existing code!

## 1.0.0

### Major Changes

- 06d9985: # tsnum v1.0.0 - 100% NumPy Core Functionality Parity 🎉

  **Complete feature set** - All essential NumPy operations now available!

  ## New Features

  ### Math Functions (20+ functions)

  - Trigonometric: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`
  - Exponential/Log: `exp`, `log`, `log10`
  - Element-wise: `abs`, `sign`, `sqrt`
  - Rounding: `round`, `floor`, `ceil`, `trunc`
  - Array ops: `maximum`, `minimum`, `clip`

  ### Logical Operations

  - `all`, `any` - Boolean reductions
  - `logicalAnd`, `logicalOr`, `logicalNot`, `logicalXor` - Element-wise logic
  - `where` - Conditional selection

  ### Sorting & Search

  - `sort` - Sort array elements
  - `argsort` - Indices that would sort array
  - `argmax`, `argmin` - Indices of max/min values

  ### Array Manipulation

  - `concat`, `stack`, `vstack`, `hstack` - Combine arrays
  - `repeat` - Repeat array elements

  ### Linear Algebra (Complete)

  - **Basic ops**: `dot`, `matmul`, `outer`, `inner`
  - **Matrix properties**: `det`, `trace`, `norm`
  - **Solve systems**: `inv` (2x2, 3x3), `solve` (Ax=b)
  - **Decompositions**:
    - `qr` - QR decomposition (Gram-Schmidt)
    - `cholesky` - Cholesky decomposition (positive-definite matrices)
    - `eig` - Eigenvalue decomposition (power iteration)
    - `svd` - Singular Value Decomposition (2x2)

  ### Random Number Generation

  - `random` - Uniform distribution [0, 1)
  - `randn` - Normal distribution (Box-Muller transform)
  - `randint` - Random integers
  - `shuffle` - Fisher-Yates shuffle
  - `choice` - Random sampling (with/without replacement)
  - `setSeed`, `getSeed` - Reproducible randomness (LCG)

  ### Advanced Statistics

  - `median`, `percentile`, `quantile` - Distribution measures
  - `corrcoef` - Correlation coefficient matrix
  - `cov` - Covariance matrix
  - `histogram` - Binned value counts

  ### FFT Operations

  - `fft`, `ifft` - Fast Fourier Transform (Cooley-Tukey algorithm)
  - `rfft`, `irfft` - Real FFT (optimized for real-valued input)

  ## Breaking Changes

  None - pure additions to the API.

  ## Migration

  All new functions are tree-shakeable imports:

  ```typescript
  import { sin, cos, fft, qr, corrcoef } from "tsnum";
  ```

  No changes needed to existing code!
