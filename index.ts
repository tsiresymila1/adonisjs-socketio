/*
|--------------------------------------------------------------------------
| Package entrypoint
|--------------------------------------------------------------------------
|
| Export values from the package entrypoint as you see fit.
|
*/

export { configure } from './configure.js'
export { defineConfig } from './src/define_config.js'
export { stubsRoot } from './stubs/main.js'
export { OnMessage, OnceMessage } from './src/decorator/handle_message.js'
