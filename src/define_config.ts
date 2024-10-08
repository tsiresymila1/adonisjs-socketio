import { ServerOptions } from "socket.io";

export function defineConfig(config?: Partial<ServerOptions>): Partial<ServerOptions>{
    return {
        ...config
    }
}