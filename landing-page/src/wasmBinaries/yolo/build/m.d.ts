/* tslint:disable */
/* eslint-disable */
/**
*/
export class Model {
  free(): void;
/**
* @param {Uint8Array} data
* @param {string} model_size
*/
  constructor(data: Uint8Array, model_size: string);
/**
* @param {Uint8Array} image
* @param {number} conf_threshold
* @param {number} iou_threshold
* @returns {string}
*/
  run(image: Uint8Array, conf_threshold: number, iou_threshold: number): string;
}
/**
*/
export class ModelPose {
  free(): void;
/**
* @param {Uint8Array} data
* @param {string} model_size
*/
  constructor(data: Uint8Array, model_size: string);
/**
* @param {Uint8Array} image
* @param {number} conf_threshold
* @param {number} iou_threshold
* @returns {string}
*/
  run(image: Uint8Array, conf_threshold: number, iou_threshold: number): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_model_free: (a: number) => void;
  readonly model_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly model_run: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbg_modelpose_free: (a: number) => void;
  readonly modelpose_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly modelpose_run: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly main: (a: number, b: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
