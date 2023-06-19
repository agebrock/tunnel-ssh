const net = require('net');
const { Client } = require('ssh2');


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
    
    if(!serverOptions.port && !serverOptions.path){
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

async function createClient(config) {
    return new Promise(function (resolve, reject) {
        let conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect(config);
    });
}

async function createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions) {

   let forwardOptionsLocal = Object.assign({}, forwardOptions);
   let tunnelOptionsLocal = Object.assign({}, tunnelOptions || {});

    return new Promise(async function (resolve, reject) {
        let server, conn;
        try {
            server = await createServer(serverOptions);
            if(!forwardOptionsLocal.srcPort){
                forwardOptionsLocal.srcPort = server.address().port;
            }
            if(!forwardOptionsLocal.srcAddr){
                forwardOptionsLocal.srcAddr = server.address().address;
            }
        } catch (e) {
            return reject(e);
        }

        try {
            conn = await createClient(sshOptions);
        } catch (e) {
            if (server) {
                server.close()
            }
            return reject(e);
        }
        server.on('connection', (connection) => {

            if (tunnelOptionsLocal.autoClose) {
                autoClose(server, connection);
            }

            conn.forwardOut(
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
                        connection.pipe(stream).pipe(connection);
                    }
                });

        });

        server.on('close', () => conn.end());
        resolve([server, conn]);
    });
}


exports.createTunnel = createTunnel;