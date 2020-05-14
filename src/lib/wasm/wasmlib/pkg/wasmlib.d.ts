/* tslint:disable */
/* eslint-disable */
/**
*/
export enum Parts {
  BASE,
  HANDLE,
  LEFT_WHEEL,
  RIGHT_WHEEL,
}
/**
*/
export class PhysicsWorld {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} part 
* @returns {any} 
*/
  get_part_position(part: number): any;
/**
* @param {number} part 
* @returns {any} 
*/
  get_part_rotation(part: number): any;
/**
*/
  step(): void;
/**
* @param {number} timestep 
*/
  set_timestep(timestep: number): void;
/**
* @param {number} torque 
*/
  set_max_left_motor_torque(torque: number): void;
/**
* @param {number} torque 
*/
  set_max_right_motor_torque(torque: number): void;
/**
* @param {number} speed 
*/
  set_left_motor_target_speed(speed: number): void;
/**
* @param {number} speed 
*/
  set_right_motor_target_speed(speed: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_physicsworld_free: (a: number) => void;
  readonly physicsworld_new: () => number;
  readonly physicsworld_get_part_position: (a: number, b: number) => number;
  readonly physicsworld_get_part_rotation: (a: number, b: number) => number;
  readonly physicsworld_step: (a: number) => void;
  readonly physicsworld_set_timestep: (a: number, b: number) => void;
  readonly physicsworld_set_max_left_motor_torque: (a: number, b: number) => void;
  readonly physicsworld_set_max_right_motor_torque: (a: number, b: number) => void;
  readonly physicsworld_set_left_motor_target_speed: (a: number, b: number) => void;
  readonly physicsworld_set_right_motor_target_speed: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        