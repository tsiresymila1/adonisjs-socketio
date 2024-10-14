import { Exception } from '@adonisjs/core/exceptions'
import type { Server } from 'socket.io'

type HandlerFunction = Parameters<Server['use']>[0]

export class SocketIoMiddleware {
  handle(..._args: Parameters<HandlerFunction>): Promise<void> | void {
    throw new Exception('Method not implemented')
  }
}
