// ===== Backend Manager =====
// WASM-first with automatic fallback

import type { Backend, BackendInit } from './types'
import { TypeScriptBackend } from './typescript'

/**
 * Global backend manager
 * Strategy: WASM-first with lazy initialization
 */
class BackendManager {
  private currentBackend: Backend
  private wasmInitPromise: Promise<BackendInit> | null = null
  private nativeBLASInitPromise: Promise<BackendInit> | null = null
  private wasmInitialized = false
  private nativeBLASInitialized = false

  constructor() {
    // Start with TypeScript backend (always available)
    this.currentBackend = new TypeScriptBackend()
  }

  /**
   * Get current backend (synchronous)
   * Returns TS backend until WASM is loaded
   */
  get(): Backend {
    return this.currentBackend
  }

  /**
   * Initialize WASM backend (lazy)
   * Called on first operation, or manually by user
   */
  async initWASM(): Promise<BackendInit> {
    // Already initialized
    if (this.wasmInitialized) {
      return { success: true, backend: this.currentBackend }
    }

    // Already initializing
    if (this.wasmInitPromise) {
      return this.wasmInitPromise
    }

    // Start initialization
    this.wasmInitPromise = this.loadWASM()
    const result = await this.wasmInitPromise

    if (result.success) {
      this.currentBackend = result.backend
      this.wasmInitialized = true
    }

    return result
  }

  /**
   * Initialize native BLAS backend when available.
   * Currently supports Bun on macOS via Accelerate.framework.
   */
  async initNativeBLAS(): Promise<BackendInit> {
    if (this.nativeBLASInitialized) {
      return { success: true, backend: this.currentBackend }
    }

    if (this.nativeBLASInitPromise) {
      return this.nativeBLASInitPromise
    }

    this.nativeBLASInitPromise = this.loadNativeBLAS()
    const result = await this.nativeBLASInitPromise

    if (result.success) {
      this.currentBackend = result.backend
      this.nativeBLASInitialized = true
    }

    return result
  }

  private async loadWASM(): Promise<BackendInit> {
    try {
      // Allow forcing TypeScript backend via environment variable (for benchmarks)
      if (typeof process !== 'undefined' && process.env?.FORCE_TS_BACKEND === '1') {
        return {
          success: false,
          error: 'TypeScript backend forced via FORCE_TS_BACKEND=1',
        }
      }

      // Check if WebAssembly is available
      if (typeof WebAssembly === 'undefined') {
        return {
          success: false,
          error: 'WebAssembly not supported in this environment',
        }
      }

      // Dynamically import WASM backend
      const { WASMBackend } = await import('./wasm')
      const wasmBackend = new WASMBackend()

      // Initialize WASM module
      await wasmBackend.init()

      return {
        success: true,
        backend: wasmBackend,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async loadNativeBLAS(): Promise<BackendInit> {
    try {
      if (typeof process !== 'undefined' && process.env?.TSNUM_NATIVE_BLAS === '0') {
        return {
          success: false,
          error: 'Native BLAS disabled via TSNUM_NATIVE_BLAS=0',
        }
      }

      if (typeof Bun === 'undefined') {
        return {
          success: false,
          error: 'Native BLAS backend currently requires Bun FFI',
        }
      }

      if (typeof process === 'undefined' || process.platform !== 'darwin') {
        return {
          success: false,
          error: 'Native BLAS backend currently supports macOS Accelerate only',
        }
      }

      const { NativeBLASBackend } = await import('./native-blas')
      const nativeBackend = new NativeBLASBackend()

      return {
        success: true,
        backend: nativeBackend,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Check if WASM is currently active
   */
  isUsingWASM(): boolean {
    return this.currentBackend.name === 'wasm' && this.currentBackend.isReady
  }

  /**
   * Check if native BLAS is currently active
   */
  isUsingNativeBLAS(): boolean {
    return this.currentBackend.name === 'native-blas' && this.currentBackend.isReady
  }

  /**
   * Force fallback to TypeScript backend
   * Useful for debugging or compatibility
   */
  useTypeScript(): void {
    this.currentBackend = new TypeScriptBackend()
    this.wasmInitialized = false
    this.nativeBLASInitialized = false
    this.wasmInitPromise = null
    this.nativeBLASInitPromise = null
  }
}

// Singleton instance
export const backendManager = new BackendManager()

/**
 * Get current backend (for operations to use)
 */
export function getBackend(): Backend {
  return backendManager.get()
}

/**
 * Initialize WASM (optional - will auto-init on first use)
 * Useful for preloading during app startup
 */
export async function initWASM(): Promise<BackendInit> {
  return backendManager.initWASM()
}

/**
 * Initialize native BLAS (optional).
 */
export async function initNativeBLAS(): Promise<BackendInit> {
  return backendManager.initNativeBLAS()
}

/**
 * Check backend status
 */
export function getBackendInfo(): {
  name: 'native-blas' | 'wasm' | 'typescript'
  ready: boolean
  usingNativeBLAS: boolean
  usingWASM: boolean
} {
  const backend = backendManager.get()
  return {
    name: backend.name,
    ready: backend.isReady,
    usingNativeBLAS: backendManager.isUsingNativeBLAS(),
    usingWASM: backendManager.isUsingWASM(),
  }
}
