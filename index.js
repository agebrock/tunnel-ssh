const net = require('net');
const { Client } = require('ssh2');
const os = require('os');

function autoClose(server, connection) {
    connection.on('close', () => {
        server.getConnections((error, count) => {
            if (count === 0) {
                server.close();
            }
        });
    });
}

async function createServer(options) {
    let serverOptions = Object.assign({}, options);

    if (!serverOptions.port && !serverOptions.path) {
        serverOptions = null;
    }

    return new Promise((resolve, reject) => {
        let server = net.createServer();
        let errorHandler = function (error) {
            reject(error);
        };
        server.on('error', errorHandler);
        process.on('uncaughtException', errorHandler);

        server.listen(serverOptions);
        server.on('listening', () => {
            process.removeListener('uncaughtException', errorHandler);
            resolve(server);
        });
    });
}

async function createSSHConnection(config) {
    return new Promise(function (resolve, reject) {
        let conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect(config);
    });
}

async function createTunnel( tunnelOptions, serverOptions, sshOptions, forwardOptions ) {

    let sshOptionslocal = Object.assign({ port: 22, username: 'root' }, sshOptions);

    let forwardOptionsLocal = Object.assign({ dstAddr: '0.0.0.0' }, forwardOptions);

    let tunnelOptionsLocal = Object.assign({ autoClose: false, reconnectOnError: false }, tunnelOptions || {});

    let server, sshConnection;


    return new Promise(async function (resolve, reject) {

        try {
            sshConnection = await createSSHConnection(sshOptionslocal);
            addListenerSshConnection(sshConnection);
        } catch (e) {
            if (server) {
                server.close()
            }
            return reject(e);
        }
        
        try {
            server = await createServer(serverOptions);
            addListenerServer(server);
        } catch (e) {
            return reject(e);
        }
        function addListenerSshConnection(sshConnection) {
            if (tunnelOptionsLocal.reconnectOnError) {
                sshConnection.on('error', async () => {
                    sshConnection.isBroken = true;
                    sshConnection = await createSSHConnection(sshOptionslocal);
                    addListenerSshConnection(sshConnection);
                });
            }
        }

        function addListenerServer(server) {
            if (tunnelOptionsLocal.reconnectOnError) {
                server.on('error', async () => {
                    server = await createServer(serverOptions);
                    addListenerServer(server);
                });
            }
            server.on('connection', onConnectionHandler);
            server.on('close', () => sshConnection.end());
        }

        function onConnectionHandler(clientConnection) {

            if (!forwardOptionsLocal.srcPort) {
                forwardOptionsLocal.srcPort = server.address().port;
            }
            if (!forwardOptionsLocal.srcAddr) {
                forwardOptionsLocal.srcAddr = server.address().address;
            }

            if (tunnelOptionsLocal.autoClose) {
                autoClose(server, clientConnection);
            }

            if (sshConnection.isBroken) {
                return;
            }

            sshConnection.forwardOut(
                forwardOptionsLocal.srcAddr,
                forwardOptionsLocal.srcPort,
                forwardOptionsLocal.dstAddr,
                forwardOptionsLocal.dstPort, (err, stream) => {
                    if (err) {
                        if (server) {
                            server.close()
                        }
                        throw err;
                    } else {
                        clientConnection.pipe(stream).pipe(clientConnection);
                    }
                });

        }
        resolve([server, sshConnection]);
    });
}


exports.createTunnel = createTunnel;
