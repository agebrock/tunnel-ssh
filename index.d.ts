/**
 * Typescript type definition file. 
 * feel free to provide pull requests. 
 * Special thanks to https://github.com/derekrliang for the initial file.
 */

import { Server, ListenOptions } from 'net';
import { Client, ConnectConfig } from 'ssh2';

declare module 'tunnel-ssh' {
  interface TunnelOptions {
    autoClose: boolean;
  }


  interface ForwardOptions {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
  }

  declare function createTunnel(
    tunnelOptions: TunnelOptions,
    serverOptions: ListenOptions,
    sshOptions: ConnectConfig,
    forwardOptions: ForwardOptions,
  ): Promise<[Server, Client]>;
}