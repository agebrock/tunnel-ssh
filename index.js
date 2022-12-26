const net = require('net');
const { Client } = require('ssh2');


function autoClose(server, connection){
    connection.on('close',()=>{
        server.getConnections((error, count)=>{
            if(count === 0){
                server.close();
            }
        });
    });
}

async function createServer(options){
    return new Promise(function(resolve, reject){
        let server = net.createServer();
        server.listen(options);
        server.on('listening', ()=> resolve(server)); 
        server.on('error', reject);
    });
}

async function createClient(config){
    return new Promise(function(resolve, reject){
        let conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect(config);
    });
}

async function createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions){

    return new Promise(function(resolve, reject){
        createServer(serverOptions).then(function(server, reject){
            createClient(sshOptions).then(function(conn){
               
                server.on('connection',(connection)=>{
                    
                    if(tunnelOptions.autoClose){
                        autoClose(server, connection);
                    }

                    conn.forwardOut(
                        forwardOptions.srcAddr, 
                        forwardOptions.srcPort, 
                        forwardOptions.dstAddr, 
                        forwardOptions.dstPort, (err, stream) => {
                            connection.pipe(stream).pipe(connection);
                    });

                });
                server.on('close',()=> conn.end());
                resolve([server, conn]);
            });
        });
    });
}


exports.createTunnel = createTunnel;