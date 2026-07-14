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
    def vector(length: int = 1_000_000, scale: float = 0.001) -> np.ndarray:
        return np.arange(length, dtype=np.float64) * scale

    def vector_b(length: int = 1_000_000) -> np.ndarray:
        return vector(length, 0.002)

    def matrix() -> np.ndarray:
        return np.arange(512 * 512, dtype=np.float64).reshape(512, 512) * 0.001

    def matmul_input(size: int = 128) -> tuple[np.ndarray, np.ndarray]:
        left = np.arange(size * size, dtype=np.float64).reshape(size, size) * 0.001
        right = np.arange(size * size, dtype=np.float64).reshape(size, size) * 0.002
        return left, right

    def add_scalar_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 100, 20, lambda: data + 5.0

    def add_scalar_1m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        out = np.empty_like(data)
        return 2000, 100, lambda: np.add(data, 5.0, out=out)

    def add_scalar_4m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector(4_000_000)
        out = np.empty_like(data)
        return 500, 100, lambda: np.add(data, 5.0, out=out)

    def add_arrays_1m() -> tuple[int, int, Callable[[], object]]:
        left = vector()
        right = vector_b()
        return 100, 20, lambda: left + right

    def add_arrays_1m_out() -> tuple[int, int, Callable[[], object]]:
        left = vector()
        right = vector_b()
        out = np.empty_like(left)
        return 2000, 100, lambda: np.add(left, right, out=out)

    def add_arrays_4m_out() -> tuple[int, int, Callable[[], object]]:
        left = vector(4_000_000)
        right = vector_b(4_000_000)
        out = np.empty_like(left)
        return 500, 100, lambda: np.add(left, right, out=out)

    def mul_scalar_1m() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        return 100, 20, lambda: data * 2.0

    def mul_scalar_1m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector()
        out = np.empty_like(data)
        return 2000, 100, lambda: np.multiply(data, 2.0, out=out)

    def mul_scalar_4m_out() -> tuple[int, int, Callable[[], object]]:
        data = vector(4_000_000)
        out = np.empty_like(data)
        return 500, 100, lambda: np.multiply(data, 2.0, out=out)

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
        return 1000, 100, lambda: np.matmul(left, right, out=out)

    def matmul_256_out() -> tuple[int, int, Callable[[], object]]:
        left, right = matmul_input(256)
        out = np.empty((256, 256), dtype=np.float64)
        return 2000, 200, lambda: np.matmul(left, right, out=out)

    cases: dict[str, Callable[[], tuple[int, int, Callable[[], object]]]] = {
        "add_scalar_1m": add_scalar_1m,
        "add_scalar_1m_out": add_scalar_1m_out,
        "add_scalar_4m_out": add_scalar_4m_out,
        "add_arrays_1m": add_arrays_1m,
        "add_arrays_1m_out": add_arrays_1m_out,
        "add_arrays_4m_out": add_arrays_4m_out,
        "mul_scalar_1m": mul_scalar_1m,
        "mul_scalar_1m_out": mul_scalar_1m_out,
        "mul_scalar_4m_out": mul_scalar_4m_out,
        "sum_1m": sum_1m,
        "mean_1m": mean_1m,
        "transpose_512": transpose_512,
        "matmul_128": matmul_128,
        "matmul_128_out": matmul_128_out,
        "matmul_256_out": matmul_256_out,
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
