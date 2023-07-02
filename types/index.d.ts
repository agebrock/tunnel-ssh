/**
 * Typescript type definition file.
 * feel free to provide pull requests.
 * Special thanks to https://github.com/derekrliang for the initial file.
 */

import { Server, ListenOptions } from "net";
import { Client, ConnectConfig } from "ssh2";


/*
* SSH client related options.
* @see https://www.npmjs.com/package/ssh2?activeTab=readme#client-methods
*/
export type SshOptions = ConnectConfig;

/*
* TCP server related options.
* @see https://nodejs.org/api/net.html#net_server_listen_options_callback
*/
export type ServerOptions = ListenOptions;


/**
 * Controls be behaviour of the tunnel server.
 */
export interface TunnelOptions {
  /*
   * specifies if the tunnel should close automatically after all clients have disconnected.
   * useful for cli scripts or any other short lived processes.
   * @default false
   */
  autoClose: boolean;
}

/**
 * If the `srcAddr` or `srcPort` is not defined, the adress will be taken from the local TCP server
 */
interface ForwardOptions {
  /*
  * The address or interface we want to listen on.
  * @default ServerOptions.address
  **/
  srcAddr?: string;
  /*
  * The port or interface we want to listen on.
  * @default ServerOptions.port
  **/
  srcPort?: number;
  /*
  * the address we want to forward the traffic to.
  * @default "0.0.0.0"
  **/
  dstAddr?: string;
  /*
  * the port we want to forward the traffic to.
  */
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
  serverOptions: ServerOptions,
  sshOptions: SshOptions,
  forwardOptions: ForwardOptions
): Promise<[Server, Client]>;
