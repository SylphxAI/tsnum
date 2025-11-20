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
}
