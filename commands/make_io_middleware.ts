/* eslint-disable prettier/prettier */
import { BaseCommand, args } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/main.js'

export default class MakeIoMiddleware extends BaseCommand {
  static description: string = 'Make io middleware'
  static commandName: string = 'make:io:middleware'

  @args.string({ description: 'Name of socketio middleware' })  
  declare name: string

  async run(): Promise<void> {
    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(stubsRoot, 'make_io_middleware.stub', { 
      entity: this.app.generators.createEntity(this.name), 
    })
  }
}
