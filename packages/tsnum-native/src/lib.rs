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
    for index in 0..input.len() {
        output[index] = input[index] + scalar;
    }
}

fn mul_scalar_into(input: &[f64], scalar: f64, output: &mut [f64]) {
    for index in 0..input.len() {
        output[index] = input[index] * scalar;
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

    for index in 0..left.len() {
        output[index] = left[index] + right[index];
    }

    Ok(())
}
