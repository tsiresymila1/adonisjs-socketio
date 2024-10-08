import { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'

import SocketIO from '../src/server.js'
import { Server, ServerOptions } from 'socket.io'

import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { getSocketIoEvent } from '../src/decorator/handle_message.js'
import { HttpContext } from '@adonisjs/core/http'

export default class SocketIoProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(SocketIO, () => {
      const config = this.app.config.get<Partial<ServerOptions>>('socketio', {})
      return new SocketIO(config)
    })
  }

  async boot() {
    const service = await this.app.container.make(SocketIO)
    service.boot()
    // Register all listeners inside service
    const servicePath = this.app.servicesPath()
    await this.#registerListener(service.io!,servicePath)

    // put io inside
    this.app.container.singleton('io', () => {
      return service.io!
    })

    // put io in context
    HttpContext.getter('io', () => {
      return service.io!
    })
  }

  async #registerListener(io: Server, directory: string) {
    const files = await readdir(directory, { withFileTypes: true })
    for (const file of files) {
      const fullPath = join(directory, file.name)
      if (file.isDirectory()) {
        await this.#registerListener(io,fullPath)
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const { default: serviceClass } = await import(pathToFileURL(fullPath).href)
        const prototype = serviceClass.prototype
        const methods = Object.getOwnPropertyNames(prototype)
        methods.forEach((method) => {
          if (typeof prototype[method] === 'function') {
            const eventInfo = getSocketIoEvent(prototype, method)
            if (eventInfo) {
              io?.[eventInfo.type](eventInfo.name, async (args: any[] | undefined) => {
                await this.app.container.call(
                  await this.app.container.make(serviceClass),
                  method,
                  args
                )
              })
            }
          }
        })
      }
    }
  }

  async ready() {
    logger.info('Socket.IO server running ...')
  }

  async shutdown() {
    const service = await this.app.container.make(SocketIO)
    await service.shutdown()
  }
}
