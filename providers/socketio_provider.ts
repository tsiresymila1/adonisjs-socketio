/* eslint-disable prettier/prettier */
import { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'

import { ServerSocket } from '../src/server.js'
import { Server, ServerOptions, Socket } from 'socket.io'

import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { getSocketIoEvent } from '../src/decorator/handle_message.js'
import { HttpContext } from '@adonisjs/core/http'
import server from '@adonisjs/core/services/server'
import { ServerResponse } from 'node:http'
import { SocketIoMiddleware } from '../src/socketio_middleware.js'

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
    this.app.container.singleton(ServerSocket, () => {
      const config = this.app.config.get<Partial<ServerOptions>>('socketio', {})
      return new ServerSocket(config)
    })
  }

  async #getAllHandler(directory: string) {
    const files = await readdir(directory, { withFileTypes: true })
    for (const file of files) {
      const fullPath = join(directory, file.name)
      if (file.isDirectory()) {
        await this.#getAllHandler(fullPath)
      } else if (
        file.isFile() &&
        !file.name.endsWith('.d.ts') &&
        (file.name.endsWith('.ts') || file.name.endsWith('.js'))
      ) {
        const { default: serviceClass } = await import(pathToFileURL(fullPath).href)
        const prototype = serviceClass.prototype
        const methods = Object.getOwnPropertyNames(prototype)
        for (const method of methods) {
          if (typeof prototype[method] === 'function') {
            const eventInfo = getSocketIoEvent(prototype, method)
            if (eventInfo) {
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

  async #registerAllMiddleware(io: Server) {
    const directory = this.app.middlewarePath()
    const files = await readdir(directory, { withFileTypes: true })
    for (const file of files) {
      const fullPath = join(directory, file.name)
      if (file.isDirectory()) {
        await this.#registerAllMiddleware(io)
      } else if (
        file.isFile() &&
        !file.name.endsWith('.d.ts') &&
        (file.name.endsWith('.ts') || file.name.endsWith('.js'))
      ) {
        const { default: MiddlewareClass } = await import(pathToFileURL(fullPath).href)
        if (typeof MiddlewareClass === 'function') {
          const prototype = MiddlewareClass.prototype
          SocketIoMiddleware.prototype
          if (MiddlewareClass.prototype instanceof SocketIoMiddleware) {
            if ('handle' in prototype && typeof prototype.handle === 'function') {
              const instance: SocketIoMiddleware = await this.app.container.make(MiddlewareClass)
              io.use(instance['handle'])
            }
          }
        }
      }
    }
  }

  async #registerHandler(io: Server) {
    io.on('connection', (socket: Socket) => {
      // logger.info(`Client connected ...${socket.id}`)
      for (const listener of this.#listeners) {
        const req = socket.request
        const res = {} as ServerResponse
        const resolver = this.app.container.createResolver()
        const request = server.createRequest(req, res)
        const response = server.createResponse(req, res)
        server.createHttpContext(request, response, resolver)
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

  async boot() {}

  async ready() {
    const serverSocket = await this.app.container.make(ServerSocket)
    serverSocket.run()
    // Register all middleware inside service
    await this.#registerAllMiddleware(serverSocket.io!)
    // Register all listeners inside service
    const servicePath = this.app.servicesPath()
    await this.#getAllHandler(servicePath)
    await this.#registerHandler(serverSocket.io!)
    // put io in context
    HttpContext.getter(
      'io',
      () => {
        return serverSocket.io!
      },
      true
    )
    this.app.container.singleton('io', () => {
      return serverSocket.io!
    })
    logger.info('Socket.IO server running ...')
  }

  async shutdown() {
    const service = await this.app.container.make(ServerSocket)
    await service.shutdown()
  }
}
