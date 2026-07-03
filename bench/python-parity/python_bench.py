import json
import platform
import sys
import time
from typing import Callable

import numpy as np


def measure(fn: Callable[[], object], iterations: int, warmup: int) -> float:
    for _ in range(warmup):
        fn()

    start = time.perf_counter()
    for _ in range(iterations):
        result = fn()
        if result is None:
            raise RuntimeError("benchmark returned None")
    return (time.perf_counter() - start) * 1000.0 / iterations


def scalar_checksum(value: object) -> float:
    if isinstance(value, np.ndarray):
        return float(value.ravel()[0]) + float(value.ravel()[-1]) + float(value.size)
    return float(value)


def main() -> None:
    vector = np.arange(1_000_000, dtype=np.float64) * 0.001
    vector_b = np.arange(1_000_000, dtype=np.float64) * 0.002
    matrix = np.arange(512 * 512, dtype=np.float64).reshape(512, 512) * 0.001
    left = np.arange(128 * 128, dtype=np.float64).reshape(128, 128) * 0.001
    right = np.arange(128 * 128, dtype=np.float64).reshape(128, 128) * 0.002

    cases: dict[str, tuple[int, int, Callable[[], object]]] = {
        "add_scalar_1m": (30, 5, lambda: vector + 5.0),
        "add_arrays_1m": (30, 5, lambda: vector + vector_b),
        "mul_scalar_1m": (30, 5, lambda: vector * 2.0),
        "sum_1m": (100, 10, lambda: np.sum(vector)),
        "mean_1m": (100, 10, lambda: np.mean(vector)),
        "transpose_512": (60, 10, lambda: matrix.T.copy()),
        "matmul_128": (20, 5, lambda: left @ right),
    }

    benchmarks = {}
    for name, (iterations, warmup, fn) in cases.items():
        last = fn()
        benchmarks[name] = {
            "time_ms": measure(fn, iterations, warmup),
            "iterations": iterations,
            "warmup": warmup,
            "checksum": scalar_checksum(last),
        }

    print(
        json.dumps(
            {
                "runtime": "python-numpy",
                "python": sys.version.split()[0],
                "numpy": np.__version__,
                "platform": platform.platform(),
                "benchmarks": benchmarks,
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
