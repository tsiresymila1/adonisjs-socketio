# @softmila/adonisjs-socketio

<br />

[![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Introduction
**Adonisjs-SocketIO** provides JavaScript API to implementation **socketio** in **AdonisJS** applications.

## Documentation

Create a service to handle event from socketio
```ts
import { OnMessage, OnceMessage} from '@softmila/adonisjs-socketio'

export default class SocketIoServiceHandler {

  @OnMessage('on_message')
  async onMessageHandler(socket: Socket, data: any){
    console.log('Data:::', data)
    const io = await app.container.make('io')
    socket.emit('on_response', {data "ok"})
  }

  @OnceMessage('once_message')
  async onceMessageHandler(socket: Socket, data: any){
    console.log('Data:', data)
  }
}
```

**io** is avalaible in **HttpContext** and **ContainerBindings** .

Note: Services that handle socketio event can't inject dependency that depends **HttpContext**.

## License
**Adonisjs-SocketIO** is open-sourced software licensed under the [MIT license](LICENSE.md).


[npm-image]: https://img.shields.io/npm/v/@softmila/adonisjs-socketio/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@softmila/adonisjs-socketio/v/latest "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/tsiresymila1/adonisjs-socketio?style=for-the-badge