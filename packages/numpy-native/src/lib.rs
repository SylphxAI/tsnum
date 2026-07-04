#![deny(clippy::all)]

use napi::bindgen_prelude::{Buffer, Float64Array};
use napi::{Error, Result, Status};
use napi_derive::napi;
#[cfg(target_os = "macos")]
use std::os::raw::c_int;

#[cfg(target_os = "macos")]
#[link(name = "Accelerate", kind = "framework")]
extern "C" {
    fn cblas_dgemm(
        order: c_int,
        trans_a: c_int,
        trans_b: c_int,
        m: c_int,
        n: c_int,
        k: c_int,
        alpha: f64,
        a: *const f64,
        lda: c_int,
        b: *const f64,
        ldb: c_int,
        beta: f64,
        c: *mut f64,
        ldc: c_int,
    );
}

#[cfg(target_os = "macos")]
const CBLAS_COLUMN_MAJOR: c_int = 102;
#[cfg(target_os = "macos")]
const CBLAS_NO_TRANS: c_int = 111;

fn uninit_vec(len: usize) -> Vec<f64> {
    vec![0.0; len]
}

#[napi]
pub fn add_scalar_f64(input: &[f64], scalar: f64) -> Float64Array {
    let mut output = uninit_vec(input.len());
    add_scalar_into(input, scalar, &mut output);
    output.into()
}

#[napi]
pub fn mul_scalar_f64(input: &[f64], scalar: f64) -> Float64Array {
    let mut output = uninit_vec(input.len());
    mul_scalar_into(input, scalar, &mut output);
    output.into()
}

#[napi]
pub fn add_f64(left: &[f64], right: &[f64]) -> Result<Float64Array> {
    let mut output = uninit_vec(left.len());
    add_into(left, right, &mut output)?;
    Ok(output.into())
}

#[napi]
pub fn add_scalar_f64_buffer(input: &[f64], scalar: f64, mut output: Buffer) -> Result<Buffer> {
    let output_slice = output_as_f64_mut(&mut output, input.len())?;
    add_scalar_into(input, scalar, output_slice);
    Ok(output)
}

#[napi]
pub fn mul_scalar_f64_buffer(input: &[f64], scalar: f64, mut output: Buffer) -> Result<Buffer> {
    let output_slice = output_as_f64_mut(&mut output, input.len())?;
    mul_scalar_into(input, scalar, output_slice);
    Ok(output)
}

#[napi]
pub fn add_f64_buffer(left: &[f64], right: &[f64], mut output: Buffer) -> Result<Buffer> {
    let output_slice = output_as_f64_mut(&mut output, left.len())?;
    add_into(left, right, output_slice)?;
    Ok(output)
}

#[napi]
pub fn add_scalar_f64_buffers(
    mut input: Buffer,
    scalar: f64,
    mut output: Buffer,
) -> Result<Buffer> {
    let input_len = input.len() / std::mem::size_of::<f64>();
    let input_slice = buffer_as_f64(&mut input, input_len)?;
    let output_slice = output_as_f64_mut(&mut output, input_len)?;
    add_scalar_into(input_slice, scalar, output_slice);
    Ok(output)
}

#[napi]
pub fn mul_scalar_f64_buffers(
    mut input: Buffer,
    scalar: f64,
    mut output: Buffer,
) -> Result<Buffer> {
    let input_len = input.len() / std::mem::size_of::<f64>();
    let input_slice = buffer_as_f64(&mut input, input_len)?;
    let output_slice = output_as_f64_mut(&mut output, input_len)?;
    mul_scalar_into(input_slice, scalar, output_slice);
    Ok(output)
}

#[napi]
pub fn add_f64_buffers(mut left: Buffer, mut right: Buffer, mut output: Buffer) -> Result<Buffer> {
    let left_len = left.len() / std::mem::size_of::<f64>();
    let left_slice = buffer_as_f64(&mut left, left_len)?;
    let right_slice = buffer_as_f64(&mut right, left_len)?;
    let output_slice = output_as_f64_mut(&mut output, left_len)?;
    add_into(left_slice, right_slice, output_slice)?;
    Ok(output)
}

#[napi]
pub fn transpose_f64_buffer(
    input: &[f64],
    rows: u32,
    cols: u32,
    mut output: Buffer,
) -> Result<Buffer> {
    let rows = rows as usize;
    let cols = cols as usize;
    let expected_len = rows
        .checked_mul(cols)
        .ok_or_else(|| Error::new(Status::InvalidArg, "Matrix dimensions overflow".to_string()))?;

    if input.len() != expected_len {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Expected input length {}, got {}",
                expected_len,
                input.len()
            ),
        ));
    }

    let output_slice = output_as_f64_mut(&mut output, expected_len)?;
    transpose_into(input, rows, cols, output_slice);
    Ok(output)
}

/// Low-overhead C ABI matmul entrypoint for Bun FFI.
///
/// Return codes:
/// - 0: success
/// - -1: null input/output pointer
/// - -2: matrix dimension overflow
/// - -3: matrix dimension is too large for CBLAS
/// - -4: Accelerate is unavailable on this platform
#[no_mangle]
pub unsafe extern "C" fn sylphx_numpy_dgemm_f64(
    left: *const f64,
    right: *const f64,
    output: *mut f64,
    rows: u32,
    inner: u32,
    cols: u32,
) -> i32 {
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (left, right, output, rows, inner, cols);
        -4
    }

    #[cfg(target_os = "macos")]
    {
        if left.is_null() || right.is_null() || output.is_null() {
            return -1;
        }

        if checked_matrix_len(rows as usize, inner as usize).is_none()
            || checked_matrix_len(inner as usize, cols as usize).is_none()
            || checked_matrix_len(rows as usize, cols as usize).is_none()
        {
            return -2;
        }

        let Some(c_rows) = to_c_int(rows as usize) else {
            return -3;
        };
        let Some(c_inner) = to_c_int(inner as usize) else {
            return -3;
        };
        let Some(c_cols) = to_c_int(cols as usize) else {
            return -3;
        };

        // Row-major C = A x B has the same memory layout as column-major
        // C^T = B^T x A^T.
        cblas_dgemm(
            CBLAS_COLUMN_MAJOR,
            CBLAS_NO_TRANS,
            CBLAS_NO_TRANS,
            c_cols,
            c_rows,
            c_inner,
            1.0,
            right,
            c_cols,
            left,
            c_inner,
            0.0,
            output,
            c_cols,
        );

        0
    }
}

#[cfg(target_os = "macos")]
fn checked_matrix_len(rows: usize, cols: usize) -> Option<usize> {
    rows.checked_mul(cols)
}

#[cfg(target_os = "macos")]
fn to_c_int(value: usize) -> Option<c_int> {
    c_int::try_from(value).ok()
}

fn buffer_as_f64(buffer: &mut Buffer, expected_len: usize) -> Result<&[f64]> {
    let bytes = buffer.as_mut();
    validate_f64_bytes(bytes, expected_len)?;
    Ok(unsafe { std::slice::from_raw_parts(bytes.as_ptr() as *const f64, expected_len) })
}

fn output_as_f64_mut(output: &mut Buffer, expected_len: usize) -> Result<&mut [f64]> {
    let bytes = output.as_mut();
    validate_f64_bytes(bytes, expected_len)?;
    Ok(unsafe { std::slice::from_raw_parts_mut(bytes.as_mut_ptr() as *mut f64, expected_len) })
}

fn validate_f64_bytes(bytes: &[u8], expected_len: usize) -> Result<()> {
    const F64_BYTES: usize = std::mem::size_of::<f64>();
    let expected_bytes = expected_len * F64_BYTES;

    if bytes.len() != expected_bytes {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Expected output byte length {}, got {}",
                expected_bytes,
                bytes.len()
            ),
        ));
    }

    if bytes.as_ptr() as usize % F64_BYTES != 0 {
        return Err(Error::new(
            Status::InvalidArg,
            "Expected buffer to be aligned for Float64Array data".to_string(),
        ));
    }

    Ok(())
}

fn ensure_equal_len(left_len: usize, right_len: usize) -> Result<()> {
    if left_len != right_len {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Expected equal input lengths, got {} and {}",
                left_len, right_len
            ),
        ));
    }
    Ok(())
}

fn add_scalar_into(input: &[f64], scalar: f64, output: &mut [f64]) {
    debug_assert_eq!(input.len(), output.len());

    let len = input.len();
    let unrolled_len = len - (len % 4);
    let mut i = 0;

    while i < unrolled_len {
        output[i] = input[i] + scalar;
        output[i + 1] = input[i + 1] + scalar;
        output[i + 2] = input[i + 2] + scalar;
        output[i + 3] = input[i + 3] + scalar;
        i += 4;
    }

    while i < len {
        output[i] = input[i] + scalar;
        i += 1;
    }
}

fn mul_scalar_into(input: &[f64], scalar: f64, output: &mut [f64]) {
    debug_assert_eq!(input.len(), output.len());

    let len = input.len();
    let unrolled_len = len - (len % 4);
    let mut i = 0;

    while i < unrolled_len {
        output[i] = input[i] * scalar;
        output[i + 1] = input[i + 1] * scalar;
        output[i + 2] = input[i + 2] * scalar;
        output[i + 3] = input[i + 3] * scalar;
        i += 4;
    }

    while i < len {
        output[i] = input[i] * scalar;
        i += 1;
    }
}

fn add_into(left: &[f64], right: &[f64], output: &mut [f64]) -> Result<()> {
    ensure_equal_len(left.len(), right.len())?;
    if left.len() != output.len() {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Expected output length {}, got {}",
                left.len(),
                output.len()
            ),
        ));
    }

    let len = left.len();
    let unrolled_len = len - (len % 4);
    let mut i = 0;

    while i < unrolled_len {
        output[i] = left[i] + right[i];
        output[i + 1] = left[i + 1] + right[i + 1];
        output[i + 2] = left[i + 2] + right[i + 2];
        output[i + 3] = left[i + 3] + right[i + 3];
        i += 4;
    }

    while i < len {
        output[i] = left[i] + right[i];
        i += 1;
    }

    Ok(())
}

fn transpose_into(input: &[f64], rows: usize, cols: usize, output: &mut [f64]) {
    debug_assert_eq!(input.len(), output.len());

    const TILE: usize = 32;

    let mut row_block = 0;
    while row_block < rows {
        let row_max = (row_block + TILE).min(rows);
        let mut col_block = 0;

        while col_block < cols {
            let col_max = (col_block + TILE).min(cols);
            let mut row = row_block;

            while row < row_max {
                let input_offset = row * cols;
                let mut col = col_block;

                while col < col_max {
                    output[col * rows + row] = input[input_offset + col];
                    col += 1;
                }

                row += 1;
            }

            col_block += TILE;
        }

        row_block += TILE;
    }
}
