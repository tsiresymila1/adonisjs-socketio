/*
|--------------------------------------------------------------------------
| Package entrypoint
|--------------------------------------------------------------------------
|
| Export values from the package entrypoint as you see fit.
|
*/

import { Server } from 'socket.io'

export { configure } from './configure.js'
export { defineConfig } from './src/define_config.js'
export { stubsRoot } from './stubs/main.js'
export {
  OnMessage,
  OnceMessage,
  OnConnect,
  OnDisconnect,
  OnAnyMessage,
} from './src/decorator/handle_message.js'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    io: Server
  }
}
