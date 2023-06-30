/**
 * Typescript type definition file.
 * feel free to provide pull requests.
 * Special thanks to https://github.com/derekrliang for the initial file.
 */

import { Server, ListenOptions } from 'net';
import { Client, ConnectConfig } from 'ssh2';

declare module 'tunnel-ssh' {
  /**
   * Controls be behaviour of the tunnel server.
   */
  interface TunnelOptions {
    autoClose: boolean;
  }

  /**
   * If the `srcAddr` or `srcPort` is not defined, the adress will be taken from the local TCP server
   */
  interface ForwardOptions {
    srcAddr?: string;
    srcPort?: number;
    dstAddr: string;
    dstPort: number;
  }

  /**
   * @param tunnelOptions - Controls be behaviour of the tunnel server.
   * @param serverOptions - Controls the behaviour of the tcp server on your local machine. For all possible options please refere to the official node.js documentation: https://nodejs.org/api/net.html#serverlistenoptions-callback
   * @param sshOptions - Options to tell the ssh client how to connect to your remote machine. For all possible options please refere to the ssh2 documentation: https://www.npmjs.com/package/ssh2?activeTab=readme
   * @param forwardOptions - Options to control the source and destination of the tunnel.
   */
  export function createTunnel(
    tunnelOptions: TunnelOptions,
    serverOptions: ListenOptions,
    sshOptions: ConnectConfig,
    forwardOptions: ForwardOptions,
  ): Promise<[Server, Client]>;
}
