---
"tsnum": minor
---

Add advanced NumPy features for improved parity

- **N-dimensional FFT**: Added `fftn`, `ifftn`, `rfftn`, `irfftn` for multi-dimensional Fourier transforms
- **Advanced array assembly**: Added `block`, `column_stack`, `array_split`, `dstack` for complex array construction
- **Numerical stability**: Added `cond` (condition number), `slogdet` (stable determinant), `multi_dot` (optimized matrix chain multiplication)
- **Math convenience functions**: Added `deg2rad`, `rad2deg`, `hypot`, `sinc`, `cbrt`, `square`, `reciprocal`, `gcd`, `lcm`, `heaviside`, `divmod`

Total: 19 new functions bringing library to 160+ NumPy-compatible operations
