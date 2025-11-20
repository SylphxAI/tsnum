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
  private wasmInitialized = false

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

  /**
   * Check if WASM is currently active
   */
  isUsingWASM(): boolean {
    return this.currentBackend.name === 'wasm' && this.currentBackend.isReady
  }

  /**
   * Force fallback to TypeScript backend
   * Useful for debugging or compatibility
   */
  useTypeScript(): void {
    this.currentBackend = new TypeScriptBackend()
    this.wasmInitialized = false
    this.wasmInitPromise = null
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
 * Check backend status
 */
export function getBackendInfo(): {
  name: 'wasm' | 'typescript'
  ready: boolean
  usingWASM: boolean
} {
  const backend = backendManager.get()
  return {
    name: backend.name,
    ready: backend.isReady,
    usingWASM: backendManager.isUsingWASM(),
  }
}
