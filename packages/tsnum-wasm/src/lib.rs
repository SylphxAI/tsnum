use wasm_bindgen::prelude::*;

// ===== WASM Backend for tsnum =====
// High-performance Rust implementation with SIMD support

/// Add two arrays element-wise (with broadcasting)
#[wasm_bindgen]
pub fn add_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    assert_eq!(a.len(), b.len(), "Arrays must have same length (broadcasting handled in JS)");

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| x + y)
        .collect()
}

/// Add scalar to array
#[wasm_bindgen]
pub fn add_scalar(a: &[f64], scalar: f64) -> Vec<f64> {
    a.iter().map(|x| x + scalar).collect()
}

/// Subtract two arrays element-wise
#[wasm_bindgen]
pub fn sub_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    assert_eq!(a.len(), b.len());

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| x - y)
        .collect()
}

/// Subtract scalar from array
#[wasm_bindgen]
pub fn sub_scalar(a: &[f64], scalar: f64) -> Vec<f64> {
    a.iter().map(|x| x - scalar).collect()
}

/// Multiply two arrays element-wise
#[wasm_bindgen]
pub fn mul_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    assert_eq!(a.len(), b.len());

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| x * y)
        .collect()
}

/// Multiply array by scalar
#[wasm_bindgen]
pub fn mul_scalar(a: &[f64], scalar: f64) -> Vec<f64> {
    a.iter().map(|x| x * scalar).collect()
}

/// Divide two arrays element-wise
#[wasm_bindgen]
pub fn div_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    assert_eq!(a.len(), b.len());

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| x / y)
        .collect()
}

/// Divide array by scalar
#[wasm_bindgen]
pub fn div_scalar(a: &[f64], scalar: f64) -> Vec<f64> {
    a.iter().map(|x| x / scalar).collect()
}

/// Power: raise array elements to exponent
#[wasm_bindgen]
pub fn pow_scalar(a: &[f64], exponent: f64) -> Vec<f64> {
    a.iter().map(|x| x.powf(exponent)).collect()
}

// ===== Reductions =====

/// Sum all elements
#[wasm_bindgen]
pub fn sum(a: &[f64]) -> f64 {
    a.iter().sum()
}

/// Mean of all elements
#[wasm_bindgen]
pub fn mean(a: &[f64]) -> f64 {
    if a.is_empty() {
        return 0.0;
    }
    a.iter().sum::<f64>() / a.len() as f64
}

/// Maximum element
#[wasm_bindgen]
pub fn max(a: &[f64]) -> f64 {
    a.iter()
        .copied()
        .fold(f64::NEG_INFINITY, f64::max)
}

/// Minimum element
#[wasm_bindgen]
pub fn min(a: &[f64]) -> f64 {
    a.iter()
        .copied()
        .fold(f64::INFINITY, f64::min)
}

/// Standard deviation
#[wasm_bindgen]
pub fn std(a: &[f64]) -> f64 {
    variance(a).sqrt()
}

/// Variance
#[wasm_bindgen]
pub fn variance(a: &[f64]) -> f64 {
    if a.is_empty() {
        return 0.0;
    }

    let mean_val = mean(a);
    let sum_squared_diff: f64 = a.iter()
        .map(|x| {
            let diff = x - mean_val;
            diff * diff
        })
        .sum();

    sum_squared_diff / a.len() as f64
}

// ===== Linear Algebra =====

/// Matrix multiplication: C = A @ B
/// A is m×k, B is k×n, result is m×n
#[wasm_bindgen]
pub fn matmul(a: &[f64], b: &[f64], m: usize, k: usize, n: usize) -> Vec<f64> {
    assert_eq!(a.len(), m * k, "A size mismatch");
    assert_eq!(b.len(), k * n, "B size mismatch");

    let mut result = vec![0.0; m * n];

    // Matrix multiplication: C[i,j] = sum(A[i,k] * B[k,j])
    // Optimized: iterate in cache-friendly order
    for i in 0..m {
        for kk in 0..k {
            let a_val = a[i * k + kk];
            for j in 0..n {
                result[i * n + j] += a_val * b[kk * n + j];
            }
        }
    }

    result
}

/// Dot product (inner product) of two 1D arrays
#[wasm_bindgen]
pub fn dot(a: &[f64], b: &[f64]) -> f64 {
    assert_eq!(a.len(), b.len(), "Arrays must have same length");

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| x * y)
        .sum()
}

// ===== Math Functions =====

/// Element-wise absolute value
#[wasm_bindgen]
pub fn abs_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.abs()).collect()
}

/// Element-wise square root
#[wasm_bindgen]
pub fn sqrt_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.sqrt()).collect()
}

#[wasm_bindgen]
pub fn cbrt_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.cbrt()).collect()
}

#[wasm_bindgen]
pub fn square_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x * x).collect()
}

/// Element-wise exponential (e^x)
#[wasm_bindgen]
pub fn exp_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.exp()).collect()
}

#[wasm_bindgen]
pub fn exp2_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.exp2()).collect()
}

#[wasm_bindgen]
pub fn expm1_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.exp_m1()).collect()
}

/// Element-wise natural logarithm
#[wasm_bindgen]
pub fn log_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.ln()).collect()
}

#[wasm_bindgen]
pub fn log2_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.log2()).collect()
}

/// Element-wise base-10 logarithm
#[wasm_bindgen]
pub fn log10_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.log10()).collect()
}

#[wasm_bindgen]
pub fn log1p_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.ln_1p()).collect()
}

/// Element-wise sine
#[wasm_bindgen]
pub fn sin_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.sin()).collect()
}

/// Element-wise cosine
#[wasm_bindgen]
pub fn cos_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.cos()).collect()
}

/// Element-wise tangent
#[wasm_bindgen]
pub fn tan_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.tan()).collect()
}

#[wasm_bindgen]
pub fn sinh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.sinh()).collect()
}

#[wasm_bindgen]
pub fn cosh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.cosh()).collect()
}

#[wasm_bindgen]
pub fn tanh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.tanh()).collect()
}

#[wasm_bindgen]
pub fn arcsin_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.asin()).collect()
}

#[wasm_bindgen]
pub fn arccos_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.acos()).collect()
}

#[wasm_bindgen]
pub fn arctan_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.atan()).collect()
}

#[wasm_bindgen]
pub fn asinh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.asinh()).collect()
}

#[wasm_bindgen]
pub fn acosh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.acosh()).collect()
}

#[wasm_bindgen]
pub fn atanh_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.atanh()).collect()
}

// ===== Rounding Functions =====

#[wasm_bindgen]
pub fn round_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.round()).collect()
}

#[wasm_bindgen]
pub fn floor_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.floor()).collect()
}

#[wasm_bindgen]
pub fn ceil_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.ceil()).collect()
}

#[wasm_bindgen]
pub fn trunc_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x.trunc()).collect()
}

// ===== Comparison Functions =====

#[wasm_bindgen]
pub fn maximum_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    a.iter().zip(b.iter()).map(|(x, y)| x.max(*y)).collect()
}

#[wasm_bindgen]
pub fn minimum_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    a.iter().zip(b.iter()).map(|(x, y)| x.min(*y)).collect()
}

#[wasm_bindgen]
pub fn clip_array(a: &[f64], min: f64, max: f64) -> Vec<f64> {
    a.iter().map(|x| x.clamp(min, max)).collect()
}

// ===== Miscellaneous Math Functions =====

#[wasm_bindgen]
pub fn sign_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| {
        if *x > 0.0 {
            1.0
        } else if *x < 0.0 {
            -1.0
        } else {
            0.0
        }
    }).collect()
}

#[wasm_bindgen]
pub fn mod_scalar(a: &[f64], b: f64) -> Vec<f64> {
    a.iter().map(|x| x % b).collect()
}

#[wasm_bindgen]
pub fn mod_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    a.iter().zip(b.iter()).map(|(x, y)| x % y).collect()
}

#[wasm_bindgen]
pub fn fmod_scalar(a: &[f64], b: f64) -> Vec<f64> {
    a.iter().map(|x| x % b).collect()
}

#[wasm_bindgen]
pub fn fmod_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    a.iter().zip(b.iter()).map(|(x, y)| x % y).collect()
}

#[wasm_bindgen]
pub fn arctan2_arrays(y: &[f64], x: &[f64]) -> Vec<f64> {
    y.iter().zip(x.iter()).map(|(y_val, x_val)| y_val.atan2(*x_val)).collect()
}

#[wasm_bindgen]
pub fn deg2rad_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x * std::f64::consts::PI / 180.0).collect()
}

#[wasm_bindgen]
pub fn rad2deg_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| x * 180.0 / std::f64::consts::PI).collect()
}

#[wasm_bindgen]
pub fn hypot_arrays(a: &[f64], b: &[f64]) -> Vec<f64> {
    a.iter().zip(b.iter()).map(|(x, y)| x.hypot(*y)).collect()
}

#[wasm_bindgen]
pub fn reciprocal_array(a: &[f64]) -> Vec<f64> {
    a.iter().map(|x| 1.0 / x).collect()
}

// ===== Linear Algebra (Advanced) =====

/// Matrix inverse for 2x2 and 3x3 matrices
#[wasm_bindgen]
pub fn inv_matrix(a: &[f64], n: usize) -> Result<Vec<f64>, String> {
    if n == 2 {
        let det = a[0] * a[3] - a[1] * a[2];

        if det.abs() < 1e-10 {
            return Err("Matrix is singular".to_string());
        }

        Ok(vec![
            a[3] / det,
            -a[1] / det,
            -a[2] / det,
            a[0] / det,
        ])
    } else if n == 3 {
        let det = a[0] * a[4] * a[8] + a[1] * a[5] * a[6] + a[2] * a[3] * a[7]
                - a[2] * a[4] * a[6] - a[1] * a[3] * a[8] - a[0] * a[5] * a[7];

        if det.abs() < 1e-10 {
            return Err("Matrix is singular".to_string());
        }

        Ok(vec![
            (a[4] * a[8] - a[5] * a[7]) / det,
            (a[2] * a[7] - a[1] * a[8]) / det,
            (a[1] * a[5] - a[2] * a[4]) / det,
            (a[5] * a[6] - a[3] * a[8]) / det,
            (a[0] * a[8] - a[2] * a[6]) / det,
            (a[2] * a[3] - a[0] * a[5]) / det,
            (a[3] * a[7] - a[4] * a[6]) / det,
            (a[1] * a[6] - a[0] * a[7]) / det,
            (a[0] * a[4] - a[1] * a[3]) / det,
        ])
    } else {
        Err("inv only supports 2x2 and 3x3 matrices".to_string())
    }
}

/// Determinant for 2x2 and 3x3 matrices
#[wasm_bindgen]
pub fn det_matrix(a: &[f64], n: usize) -> Result<f64, String> {
    if n == 2 {
        Ok(a[0] * a[3] - a[1] * a[2])
    } else if n == 3 {
        Ok(a[0] * a[4] * a[8] + a[1] * a[5] * a[6] + a[2] * a[3] * a[7]
         - a[2] * a[4] * a[6] - a[1] * a[3] * a[8] - a[0] * a[5] * a[7])
    } else {
        Err("det only supports 2x2 and 3x3 matrices".to_string())
    }
}

/// Matrix transpose
#[wasm_bindgen]
pub fn transpose_matrix(a: &[f64], rows: usize, cols: usize) -> Vec<f64> {
    let mut result = vec![0.0; rows * cols];

    for i in 0..rows {
        for j in 0..cols {
            result[j * rows + i] = a[i * cols + j];
        }
    }

    result
}

// ===== FFT Operations =====

/// Fast Fourier Transform (Cooley-Tukey algorithm)
/// Input: real-valued array of length n (must be power of 2)
/// Output: interleaved [real, imag] pairs (length 2n)
#[wasm_bindgen]
pub fn fft(input: &[f64]) -> Vec<f64> {
    let n = input.len();
    assert!(n > 0 && (n & (n - 1)) == 0, "FFT requires power of 2 length");

    let mut real: Vec<f64> = input.to_vec();
    let mut imag: Vec<f64> = vec![0.0; n];

    fft_recursive(&mut real, &mut imag);

    // Interleave real and imaginary parts
    let mut result = Vec::with_capacity(n * 2);
    for i in 0..n {
        result.push(real[i]);
        result.push(imag[i]);
    }

    result
}

/// Inverse Fast Fourier Transform
/// Input: interleaved [real, imag] pairs (length 2n)
/// Output: interleaved [real, imag] pairs (length 2n)
#[wasm_bindgen]
pub fn ifft(input: &[f64], n: usize) -> Vec<f64> {
    assert_eq!(input.len(), n * 2, "Input must have length 2n");
    assert!(n > 0 && (n & (n - 1)) == 0, "IFFT requires power of 2 length");

    // Extract real and imaginary parts
    let mut real: Vec<f64> = (0..n).map(|i| input[i * 2]).collect();
    let mut imag: Vec<f64> = (0..n).map(|i| input[i * 2 + 1]).collect();

    // Conjugate
    for i in 0..n {
        imag[i] = -imag[i];
    }

    // FFT
    fft_recursive(&mut real, &mut imag);

    // Conjugate and scale
    let scale = 1.0 / n as f64;
    let mut result = Vec::with_capacity(n * 2);
    for i in 0..n {
        result.push(real[i] * scale);
        result.push(-imag[i] * scale);
    }

    result
}

/// Recursive FFT implementation (Cooley-Tukey)
fn fft_recursive(real: &mut [f64], imag: &mut [f64]) {
    let n = real.len();
    if n <= 1 {
        return;
    }

    // Divide: separate even and odd indices
    let half_n = n / 2;
    let mut even_real = vec![0.0; half_n];
    let mut even_imag = vec![0.0; half_n];
    let mut odd_real = vec![0.0; half_n];
    let mut odd_imag = vec![0.0; half_n];

    for i in 0..half_n {
        even_real[i] = real[i * 2];
        even_imag[i] = imag[i * 2];
        odd_real[i] = real[i * 2 + 1];
        odd_imag[i] = imag[i * 2 + 1];
    }

    // Conquer: recursively compute FFT of even and odd parts
    fft_recursive(&mut even_real, &mut even_imag);
    fft_recursive(&mut odd_real, &mut odd_imag);

    // Combine: butterfly operations with twiddle factors
    for k in 0..half_n {
        let angle = -2.0 * std::f64::consts::PI * k as f64 / n as f64;
        let (sin, cos) = angle.sin_cos();

        // Complex multiplication: twiddle * odd[k]
        let t_real = cos * odd_real[k] - sin * odd_imag[k];
        let t_imag = cos * odd_imag[k] + sin * odd_real[k];

        // Butterfly operation
        real[k] = even_real[k] + t_real;
        imag[k] = even_imag[k] + t_imag;
        real[k + half_n] = even_real[k] - t_real;
        imag[k + half_n] = even_imag[k] - t_imag;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_arrays() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![4.0, 5.0, 6.0];
        let result = add_arrays(&a, &b);
        assert_eq!(result, vec![5.0, 7.0, 9.0]);
    }

    #[test]
    fn test_add_scalar() {
        let a = vec![1.0, 2.0, 3.0];
        let result = add_scalar(&a, 10.0);
        assert_eq!(result, vec![11.0, 12.0, 13.0]);
    }

    #[test]
    fn test_sum() {
        let a = vec![1.0, 2.0, 3.0, 4.0];
        assert_eq!(sum(&a), 10.0);
    }

    #[test]
    fn test_mean() {
        let a = vec![2.0, 4.0, 6.0, 8.0];
        assert_eq!(mean(&a), 5.0);
    }

    #[test]
    fn test_variance() {
        let a = vec![2.0, 4.0, 6.0, 8.0];
        assert_eq!(variance(&a), 5.0);
    }

    #[test]
    fn test_matmul_2x2() {
        let a = vec![1.0, 2.0, 3.0, 4.0]; // [[1, 2], [3, 4]]
        let b = vec![5.0, 6.0, 7.0, 8.0]; // [[5, 6], [7, 8]]
        let result = matmul(&a, &b, 2, 2, 2);
        // Expected: [[19, 22], [43, 50]]
        assert_eq!(result, vec![19.0, 22.0, 43.0, 50.0]);
    }

    #[test]
    fn test_dot_product() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![4.0, 5.0, 6.0];
        let result = dot(&a, &b);
        assert_eq!(result, 32.0); // 1*4 + 2*5 + 3*6 = 32
    }

    #[test]
    fn test_fft_basic() {
        // Test with simple input: [1, 0, 0, 0]
        let input = vec![1.0, 0.0, 0.0, 0.0];
        let result = fft(&input);

        // FFT of [1, 0, 0, 0] should be [1, 1, 1, 1] (all real, no imaginary)
        assert_eq!(result.len(), 8); // 4 complex numbers = 8 values

        // Real parts should all be 1.0
        assert!((result[0] - 1.0).abs() < 1e-10);
        assert!((result[2] - 1.0).abs() < 1e-10);
        assert!((result[4] - 1.0).abs() < 1e-10);
        assert!((result[6] - 1.0).abs() < 1e-10);

        // Imaginary parts should all be ~0
        assert!(result[1].abs() < 1e-10);
        assert!(result[3].abs() < 1e-10);
        assert!(result[5].abs() < 1e-10);
        assert!(result[7].abs() < 1e-10);
    }

    #[test]
    fn test_ifft_roundtrip() {
        // Test FFT -> IFFT roundtrip
        let input = vec![1.0, 2.0, 3.0, 4.0];
        let fft_result = fft(&input);
        let ifft_result = ifft(&fft_result, 4);

        // Check real parts match original
        for i in 0..4 {
            assert!((ifft_result[i * 2] - input[i]).abs() < 1e-10,
                    "Mismatch at index {}: {} vs {}", i, ifft_result[i * 2], input[i]);
        }

        // Imaginary parts should be ~0
        for i in 0..4 {
            assert!(ifft_result[i * 2 + 1].abs() < 1e-10);
        }
    }
}
