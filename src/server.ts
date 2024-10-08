import server from '@adonisjs/core/services/server'
import { Server, ServerOptions } from 'socket.io'

export default class SocketIO {
  io: Server | undefined
  #booted: boolean = false

  constructor(protected config?: Partial<ServerOptions>) {}

  boot() {
    if (this.#booted) {
      return
    }
    this.#booted = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
      ...this.config,
    })
  }

  async shutdown() {
    if (this.#booted) {
      await this.io?.removeAllListeners()
      await this.io?.close()
    }
  }
}
