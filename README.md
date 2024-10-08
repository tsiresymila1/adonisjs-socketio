# @softmila/adonisjs-socketio

<br />

[![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Introduction
**Adonisjs-Socketio** provides JavaScript API to implementation **socketio** in **AdonisJS** applications.

## Documentation

Create a service to handle event from socketio
```ts
import { OnMessage, OnceMessage} from '@softmila/adonisjs-socketio'

@inject()
export default class SocketIoServcieHandler {

  construct(protected ctx: HttpContext ){}

  @OnMessage('on_message')
  async onMessageHandler(data: any){
    console.log('Data:', data)
    this.ctx.io.emit('on_response', {data "ok"})
  }

  @OnceMessage('once_message')
  async onceMessageHandler(data: any){
    console.log('Data:', data)
  }
}
```

**io** is avalaible in **HTTPContext**.

## License
**Adonisjs-Socketio** is open-sourced software licensed under the [MIT license](LICENSE.md).


[npm-image]: https://img.shields.io/npm/v/@softmila/adonisjs-socketio/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@softmila/adonisjs-socketio/v/latest "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/tsiresymila1/adonisjs-socketio?style=for-the-badge