// Type definitions for pino-debug
// Project: Stash
// Definitions by: bluepostit <https://github.com/bluepostit>

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('pino-debug');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from 'pino-debug';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

import P from 'pino'

/*~ This declaration specifies that the function
 *~ is the exported object from the file
 */
export = PinoDebug;

declare function PinoDebug(
  logger: P.Logger,
  options: PinoDebug.PinoDebugOptions | {}
): void

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block. Often you will want to describe the
 *~ shape of the return type of the function; that type should
 *~ be declared in here, as this example shows.
 *~
 *~ Note that if you decide to include this namespace, the module can be
 *~ incorrectly imported as a namespace object, unless
 *~ --esModuleInterop is turned on:
 *~   import * as x from 'pino-debug'; // WRONG! DO NOT DO THIS!
 */
declare namespace PinoDebug {
  export interface PinoDebugOptions {
    auto?: boolean
    map?: object | {}
    skip?: string[]
  }
}
