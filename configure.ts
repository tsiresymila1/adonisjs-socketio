/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(_command: ConfigureCommand) {
  const codemods = await _command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/socketio.stub', {})

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile
      .addProvider('@softmila/adonisjs-socketio/socketio_provider')
      .addCommand('@softmila/adonisjs-socketio/commands')
      .setCommandAlias('iomiddleware', 'make:io:middleware')
  })
}
