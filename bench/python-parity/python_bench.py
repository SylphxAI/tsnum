import json
import os
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
    def vector() -> np.ndarray:
        return np.arange(1_000_000, dtype=np.float64) * 0.001

    def vector_b() -> np.ndarray:
        return np.arange(1_000_000, dtype=np.float64) * 0.002

    def matrix() -> np.ndarray:
        return np.arange(512 * 512, dtype=np.float64).reshape(512, 512) * 0.001

    def matmul_input() -> tuple[np.ndarray, np.ndarray]:
        left = np.arange(128 * 128, dtype=np.float64).reshape(128, 128) * 0.001
        right = np.arange(128 * 128, dtype=np.float64).reshape(128, 128) * 0.002
        return left, right

    def add_scalar_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 100, 20, lambda: data + 5.0

    def add_scalar_1m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        out = np.empty_like(data)
        return 2000, 100, lambda: np.add(data, 5.0, out=out)

    def add_arrays_1m() -> tuple[int, int, Callable[[], object]]:
        left = vector()
        right = vector_b()
        return 100, 20, lambda: left + right

    def add_arrays_1m_out() -> tuple[int, int, Callable[[], object]]:
        left = vector()
        right = vector_b()
        out = np.empty_like(left)
        return 2000, 100, lambda: np.add(left, right, out=out)

    def mul_scalar_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 100, 20, lambda: data * 2.0

    def mul_scalar_1m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        out = np.empty_like(data)
        return 2000, 100, lambda: np.multiply(data, 2.0, out=out)

    def sum_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 300, 30, lambda: np.sum(data)

    def mean_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 300, 30, lambda: np.mean(data)

    def transpose_512() -> tuple[int, int, Callable[[], object]]:
        data = matrix()
        return 120, 20, lambda: data.T.copy()

    def matmul_128() -> tuple[int, int, Callable[[], object]]:
        left, right = matmul_input()
        return 1000, 100, lambda: left @ right

    def matmul_128_out() -> tuple[int, int, Callable[[], object]]:
        left, right = matmul_input()
        out = np.empty((128, 128), dtype=np.float64)
        return 20000, 2000, lambda: np.matmul(left, right, out=out)

    cases: dict[str, Callable[[], tuple[int, int, Callable[[], object]]]] = {
        "add_scalar_1m": add_scalar_1m,
        "add_scalar_1m_out": add_scalar_1m_out,
        "add_arrays_1m": add_arrays_1m,
        "add_arrays_1m_out": add_arrays_1m_out,
        "mul_scalar_1m": mul_scalar_1m,
        "mul_scalar_1m_out": mul_scalar_1m_out,
        "sum_1m": sum_1m,
        "mean_1m": mean_1m,
        "transpose_512": transpose_512,
        "matmul_128": matmul_128,
        "matmul_128_out": matmul_128_out,
    }

    selected_case = os.environ.get("PYTHON_PARITY_CASE")
    if selected_case:
        if selected_case not in cases:
            raise ValueError(f"Unknown PYTHON_PARITY_CASE: {selected_case}")
        cases = {selected_case: cases[selected_case]}

    benchmarks = {}
    for name, create_case in cases.items():
        iterations, warmup, fn = create_case()
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
