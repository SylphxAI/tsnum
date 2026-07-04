# Python Parity Benchmark

This benchmark compares `@sylphx/numpy` against Python/NumPy on the same
machine. It is the admission evidence for Python-compatible performance claims.

## Setup

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r bench/python-parity/requirements.txt
```

## Run

```bash
bun run bench:python-parity
bun run bench:python-parity:enforce
bun run bench:python-parity:report:check
```

Without activating the venv:

```bash
PYTHON=.venv/bin/python bun run bench:python-parity
PYTHON=.venv/bin/python bun run bench:python-parity:enforce
```

Default runs print and save median ratios across multiple samples. Checksum
parity is always enforced across every sample. Enforcement runs additionally
fail when any covered operation is slower than NumPy by more than the configured
threshold.

Each run writes:

- `bench/python-parity/results/latest.json`
- `bench/python-parity/results/latest.md`

The Markdown report is generated from the JSON output. CI runs
`bench:python-parity:report:check` after the benchmark and uploads both files as
the `python-parity-report` artifact.

## Contract

- Reference runtime: Python with NumPy.
- Native backend: Bun/macOS runs attempt `initNativeBLAS()` before measuring.
- Default max slowdown: `1.05`.
- Override: `PYTHON_PARITY_MAX_SLOWDOWN=1.10`.
- Default samples per runtime: `3`.
- Sample override: `PYTHON_PARITY_RUNS=5`.
- Checksum tolerance: `PYTHON_PARITY_CHECKSUM_ATOL=1e-6` and
  `PYTHON_PARITY_CHECKSUM_RTOL=1e-9`.
- Disable native backend: `TSNUM_NATIVE_BLAS=0`.
- Python executable override: `PYTHON=/path/to/python`.
- Result file: `bench/python-parity/results/latest.json`.
- Report file: `bench/python-parity/results/latest.md`.
