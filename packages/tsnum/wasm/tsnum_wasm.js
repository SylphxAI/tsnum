let wasm

let cachedFloat64ArrayMemory0 = null

function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer)
  }
  return cachedFloat64ArrayMemory0
}

let WASM_VECTOR_LEN = 0

function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8, 8) >>> 0
  getFloat64ArrayMemory0().set(arg, ptr / 8)
  WASM_VECTOR_LEN = arg.length
  return ptr
}
/**
 * Mean of all elements
 * @param {Float64Array} a
 * @returns {number}
 */
export function mean(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.mean(ptr0, len0)
  return ret
}

/**
 * Minimum element
 * @param {Float64Array} a
 * @returns {number}
 */
export function min(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.min(ptr0, len0)
  return ret
}

function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len)
}
/**
 * Add scalar to array
 * @param {Float64Array} a
 * @param {number} scalar
 * @returns {Float64Array}
 */
export function add_scalar(a, scalar) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.add_scalar(ptr0, len0, scalar)
  var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v2
}

/**
 * Standard deviation
 * @param {Float64Array} a
 * @returns {number}
 */
export function std(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.std(ptr0, len0)
  return ret
}

/**
 * Sum all elements
 * @param {Float64Array} a
 * @returns {number}
 */
export function sum(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.sum(ptr0, len0)
  return ret
}

/**
 * Multiply array by scalar
 * @param {Float64Array} a
 * @param {number} scalar
 * @returns {Float64Array}
 */
export function mul_scalar(a, scalar) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.mul_scalar(ptr0, len0, scalar)
  var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v2
}

/**
 * Power: raise array elements to exponent
 * @param {Float64Array} a
 * @param {number} exponent
 * @returns {Float64Array}
 */
export function pow_scalar(a, exponent) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.pow_scalar(ptr0, len0, exponent)
  var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v2
}

/**
 * Divide array by scalar
 * @param {Float64Array} a
 * @param {number} scalar
 * @returns {Float64Array}
 */
export function div_scalar(a, scalar) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.div_scalar(ptr0, len0, scalar)
  var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v2
}

/**
 * Subtract scalar from array
 * @param {Float64Array} a
 * @param {number} scalar
 * @returns {Float64Array}
 */
export function sub_scalar(a, scalar) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.sub_scalar(ptr0, len0, scalar)
  var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v2
}

/**
 * Subtract two arrays element-wise
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function sub_arrays(a, b) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.sub_arrays(ptr0, len0, ptr1, len1)
  var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v3
}

/**
 * Maximum element
 * @param {Float64Array} a
 * @returns {number}
 */
export function max(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.max(ptr0, len0)
  return ret
}

/**
 * Add two arrays element-wise (with broadcasting)
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function add_arrays(a, b) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.add_arrays(ptr0, len0, ptr1, len1)
  var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v3
}

/**
 * Multiply two arrays element-wise
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function mul_arrays(a, b) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.mul_arrays(ptr0, len0, ptr1, len1)
  var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v3
}

/**
 * Variance
 * @param {Float64Array} a
 * @returns {number}
 */
export function variance(a) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.variance(ptr0, len0)
  return ret
}

/**
 * Divide two arrays element-wise
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function div_arrays(a, b) {
  const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.div_arrays(ptr0, len0, ptr1, len1)
  var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 8, 8)
  return v3
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default'])

async function __wbg_load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type)

        if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e,
          )
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module }
    } else {
      return instance
    }
  }
}

function __wbg_get_imports() {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbindgen_init_externref_table = () => {
    const table = wasm.__wbindgen_externrefs
    const offset = table.grow(4)
    table.set(0, undefined)
    table.set(offset + 0, undefined)
    table.set(offset + 1, null)
    table.set(offset + 2, true)
    table.set(offset + 3, false)
  }

  return imports
}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports
  __wbg_init.__wbindgen_wasm_module = module
  cachedFloat64ArrayMemory0 = null

  wasm.__wbindgen_start()
  return wasm
}

function initSync(module) {
  if (wasm !== undefined) return wasm

  if (typeof module !== 'undefined') {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ;({ module } = module)
    } else {
      console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
    }
  }

  const imports = __wbg_get_imports()

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module)
  }

  const instance = new WebAssembly.Instance(module, imports)

  return __wbg_finalize_init(instance, module)
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm

  if (typeof module_or_path !== 'undefined') {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ;({ module_or_path } = module_or_path)
    } else {
      console.warn(
        'using deprecated parameters for the initialization function; pass a single object instead',
      )
    }
  }

  if (typeof module_or_path === 'undefined') {
    module_or_path = new URL('tsnum_wasm_bg.wasm', import.meta.url)
  }
  const imports = __wbg_get_imports()

  if (
    typeof module_or_path === 'string' ||
    (typeof Request === 'function' && module_or_path instanceof Request) ||
    (typeof URL === 'function' && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path)
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports)

  return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
