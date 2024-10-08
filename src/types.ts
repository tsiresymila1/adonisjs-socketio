import { Server } from 'socket.io'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    io: Server
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    io: Server
  }
}
