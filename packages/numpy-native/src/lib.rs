#![deny(clippy::all)]

use napi::bindgen_prelude::{Buffer, Float64Array};
use napi::{Error, Result, Status};
use napi_derive::napi;

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
