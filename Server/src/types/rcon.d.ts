/**
 * Type declarations for rcon module
 */
declare module 'rcon' {
  import { EventEmitter } from 'events';

  class Rcon extends EventEmitter {
    constructor(host: string, port: number, password: string);
    connect(): void;
    disconnect(): void;
    send(data: string, cmd?: number, id?: number): void;
    on(event: 'auth' | 'response' | 'error' | 'end' | 'connect' | 'server', listener: (...args: any[]) => void): this;
    once(event: 'auth' | 'response' | 'error' | 'end' | 'connect' | 'server', listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
  }

  export = Rcon;
}



