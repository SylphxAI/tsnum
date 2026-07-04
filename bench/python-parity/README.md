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
bun run bench:python-parity:repeatability
bun run bench:python-parity:report:check
bun run bench:native-dispatch
```

Without activating the venv:

```bash
PYTHON=.venv/bin/python bun run bench:python-parity
PYTHON=.venv/bin/python bun run bench:python-parity:enforce
PYTHON=.venv/bin/python bun run bench:python-parity:repeatability
```

To debug one row directly:

```bash
PYTHON_PARITY_CASE=matmul_128 python bench/python-parity/python_bench.py
PYTHON_PARITY_CASE=matmul_128 bun run bench/python-parity/ts_bench.ts
```

Default runs print and save median ratios across multiple samples. Each sample
executes Python and Bun in separate runtime processes with alternating runtime
order. Cases share that runtime process and still keep per-case setup, warmup,
and timed iterations. This measures steady-state library behavior for training
and numerical loops without charging Bun native-backend initialization or JIT
warmup to every individual case. Checksum parity is always enforced across every
sample. Enforcement runs additionally fail when any covered operation is slower
than NumPy by more than the configured threshold.

Each run writes:

- `bench/python-parity/results/latest.json`
- `bench/python-parity/results/latest.md`

The Markdown report is generated from the JSON output. CI runs
`bench:python-parity:report:check` after the benchmark and uploads both files as
the `python-parity-report` artifact.

`bench:python-parity:repeatability` is the release-path gate. It runs
`bench/python-parity/compare.ts --enforce` multiple times and fails unless every
attempt passes. The default is three attempts, configurable with
`PYTHON_PARITY_REPEAT_ATTEMPTS=5`. It writes ignored local release evidence:

- `bench/python-parity/results/repeatability-latest.json`
- `bench/python-parity/results/repeatability-latest.md`

`bench:native-dispatch` is a diagnostic probe for backend work. It measures the
same float64 vector operations at the native N-API kernel layer, TypeScript
backend layer, NativeBLAS backend layer, and public API layer. It also records
allocation-return rows so release-blocking non-`out` overhead can be separated
from preallocated kernel speed. Use it before changing dispatch or native
kernels so wrapper overhead is separated from kernel speed. It writes ignored
local reports:

- `bench/python-parity/results/native-dispatch-latest.json`
- `bench/python-parity/results/native-dispatch-latest.md`

CI also uploads these files as the `native-dispatch-report` artifact whenever
the probe runs.

The vector-operation probe defaults to short samples so CI remains fast. The
`matmul128` rows use parity-equivalent defaults of 7 samples, 100 warmup
iterations, and 1000 measured iterations so small-matrix overhead can be
compared against the Python parity report on the same runner.

This probe does not replace `bench:python-parity:repeatability`; publish
readiness still depends on the release Python parity gate.

Python parity `*_out` cases preallocate both the output array and the
TypeScript options object during case setup. The timed body measures the
preallocated `out` call path, matching the intended hot-loop contract instead of
charging a fresh JavaScript options-object allocation to every numeric kernel
iteration. The `out` rows use 2000 measured iterations and 100 warmups per
sample because their timed bodies are sub-millisecond on GitHub macOS runners.
`matmul_128` uses 5000 measured iterations and 500 warmups for the same reason.
The longer samples reduce timer and runner-noise sensitivity without changing
the 1.05x speed threshold.

## Contract

- Reference runtime: Python with NumPy.
- Native backend: Bun/macOS runs attempt `initNativeBLAS()` before measuring.
- Process isolation: default runs spawn a fresh Python or Bun process per
  runtime/sample. Cases share that runtime process with per-case warmups.
- Single-case debug: use `PYTHON_PARITY_CASE` to run one case in a fresh
  runtime process.
- `*_out` cases preallocate the output array and TypeScript options object
  before timed iterations.
- Slowdown metric: `@sylphx/numpy` median time divided by Python median time.
  Paired slowdown p95 is kept as diagnostic runner-volatility evidence.
- Default max slowdown: `1.05`.
- Override: `PYTHON_PARITY_MAX_SLOWDOWN=1.10`.
- Default samples per runtime: `7`.
- Sample override: `PYTHON_PARITY_RUNS=5`.
- Default release repeatability attempts: `3`.
- Repeatability override: `PYTHON_PARITY_REPEAT_ATTEMPTS=5`.
- Native dispatch matmul overrides:
  `NATIVE_DISPATCH_PROBE_MATMUL_SAMPLES`,
  `NATIVE_DISPATCH_PROBE_MATMUL_WARMUP`, and
  `NATIVE_DISPATCH_PROBE_MATMUL_ITERATIONS`.
- Checksum tolerance: `PYTHON_PARITY_CHECKSUM_ATOL=1e-6` and
  `PYTHON_PARITY_CHECKSUM_RTOL=1e-9`.
- Disable native backend: `TSNUM_NATIVE_BLAS=0`.
- Python executable override: `PYTHON=/path/to/python`.
- Result file: `bench/python-parity/results/latest.json`.
- Report file: `bench/python-parity/results/latest.md`.
