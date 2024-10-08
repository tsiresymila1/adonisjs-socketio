import 'reflect-metadata'
import { Metadata } from './metadata.js'
export type EventInfo = {
  name: string
  type: 'on' | 'once' | 'onAny'
}

function HandleMessage(info: EventInfo) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(Metadata.DECORATOR, info, target, propertyKey)
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args)
    }
    return descriptor
  }
}

export function OnMessage(eventName: string) {
  return HandleMessage({ name: eventName, type: 'on' })
}

export function OnceMessage(eventName: string) {
  return HandleMessage({ name: eventName, type: 'once' })
}

export function OnConnect() {
  return HandleMessage({ name: 'connection', type: 'on' })
}

export function OnDisconnect() {
  return HandleMessage({ name: 'disconnect', type: 'on' })
}

export function OnAnyMessage() {
  return HandleMessage({ name: '*', type: 'onAny' })
}

export const getSocketIoEvent = (target: any, methodName: string): EventInfo | undefined => {
  return Reflect.getMetadata(Metadata.DECORATOR, target, methodName)
}
