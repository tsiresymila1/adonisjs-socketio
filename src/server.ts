import server from '@adonisjs/core/services/server'
import { Server, ServerOptions } from 'socket.io'

export class ServerSocket {
  io: Server | undefined
  #started: boolean = false
  config: Partial<ServerOptions> | undefined

  constructor(config?: Partial<ServerOptions>) {
    this.config = config
  }

  run() {
    if (this.#started) {
      return
    }
    this.#started = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
      ...this.config,
    })
  }

  async shutdown() {
    if (this.#started) {
      await this.io?.removeAllListeners()
    }
  }
}
