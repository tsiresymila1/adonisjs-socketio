import { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'

import SocketIO from '../src/server.js'
import { Server, ServerOptions, Socket } from 'socket.io'

import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { getSocketIoEvent } from '../src/decorator/handle_message.js'
import { HttpContext } from '@adonisjs/core/http'

type HandlerItem = {
  eventName: string
  type: 'on' | 'once' | 'onAny'
  service: any
  method: string
}
export default class SocketIoProvider {
  constructor(protected app: ApplicationService) {}

  #listeners: Array<HandlerItem> = []

  register() {
    this.app.container.singleton(SocketIO, () => {
      const config = this.app.config.get<Partial<ServerOptions>>('socketio', {})
      return new SocketIO(config)
    })
  }

  async boot() {}

  async #registerListener(directory: string) {
    const files = await readdir(directory, { withFileTypes: true })
    for (const file of files) {
      const fullPath = join(directory, file.name)
      if (file.isDirectory()) {
        await this.#registerListener(fullPath)
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const { default: serviceClass } = await import(pathToFileURL(fullPath).href)
        const prototype = serviceClass.prototype
        const methods = Object.getOwnPropertyNames(prototype)
        for (const method of methods) {
          if (typeof prototype[method] === 'function') {
            const eventInfo = getSocketIoEvent(prototype, method)
            if (eventInfo) {
              logger.info(
                `SocketIO handler [${serviceClass.name}.${method}] for event [${eventInfo.name}]`
              )
              this.#listeners.push({
                eventName: eventInfo.name,
                type: eventInfo.type,
                service: serviceClass,
                method,
              })
            }
          }
        }
      }
    }
  }

  async #registerHandler(io: Server) {
    io.on('connection', (socket: Socket) => {
      logger.info(`Client connected ...${socket.id}`)
      for (const listener of this.#listeners) {
        const handler = async (data: any) => {
          const instance = await this.app.container.make(listener.service)
          await this.app.container.call(instance, listener.method, [socket, data])
        }
        if (listener.type === 'onAny') {
          socket[listener.type](handler)
        } else {
          socket[listener.type](listener.eventName, handler)
        }
      }
    })
  }

  async ready() {
    const service = await this.app.container.make(SocketIO)
    service.boot()
    // Register all listeners inside service
    const servicePath = this.app.servicesPath()
    await this.#registerListener(servicePath)
    await this.#registerHandler(service.io!)

    // put io in context
    HttpContext.getter(
      'io',
      () => {
        return service.io!
      },
      true
    )
    logger.info('Socket.IO server running ...')
  }

  async shutdown() {
    const service = await this.app.container.make(SocketIO)
    await service.shutdown()
  }
}
