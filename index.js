var net = require('net');
var debug = require('debug')('tunnel-ssh');
var Connection = require('ssh2');
var createConfig = require('./lib/config');
var events = require('events');
var noop = function () {
};

function bindSSHConnection(config, netConnection, sshConnection) {

    netConnection.emit('sshConnection', sshConnection, netConnection);
    sshConnection.forwardOut(config.srcHost, config.srcPort, config.dstHost, config.dstPort, function (err, sshStream) {
        if (err) {
            // Bubble up the error => netConnection => server
            netConnection.emit('error', err);
            debug('Destination port:', err);
            return;
        }

        debug('sshStream:create');
        netConnection.emit('sshStream', sshStream);
        netConnection.pipe(sshStream).pipe(netConnection);
    });
    return sshConnection;
}

function createTunnel(config) {
    var tunnel = new events.EventEmitter();
    var server;
    var connections = [];
    var connectionCount = 0;
    var sshConnection;
    tunnel.sshConnection = sshConnection = new Connection();
    sshConnection.on('ready', function () {
        debug('sshConnection:ready');
        tunnel.server = server = net.createServer(function (netConnection) {
            connectionCount++;
            netConnection.on('error', server.emit.bind(server, 'error'));
            netConnection.on('end', function () {
                debug('netConnection::end');
                connectionCount--;
                if (connectionCount === 0) {
                    if (!config.keepAlive) {
                        setTimeout(function () {
                            if (connectionCount === 0) {
                                server.close();
                            }
                        }, 2);
                    }
                }
            });

            bindSSHConnection(config, netConnection, sshConnection);
            netConnection.on('sshStream', function (sshStream) {
                connections.push(netConnection);
                sshStream.on('error', function () {
                    server.close();
                });
            });
            server.emit('netConnection', netConnection, server);
        });

        sshConnection.on('error', server.emit.bind(server, 'error'));
        server.on('close', function () {
            connections.forEach(function (connection) {
                connection.end();
            });
            sshConnection.end();
        });
        tunnel.emit('server', server);
    });

    sshConnection.connect(config);
    return tunnel;
}

function tunnel(configArgs, callback) {
    var tunnel;
    var config;

    if (!callback) {
        callback = noop;
    }
    try {
        config = createConfig(configArgs);
        tunnel = createTunnel(config);
        tunnel.on('server', function (server) {
            server.listen(config.localPort, config.localHost, function (error) {
                callback(error, server);
            });
        });
    } catch (e) {
        tunnel = new events.EventEmitter();
        setImmediate(function () {
            callback(e);
            tunnel.emit('error', e);
        });
    }
    return tunnel;
}

module.exports = tunnel;
