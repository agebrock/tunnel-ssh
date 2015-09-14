var net = require('net');
var _ = require('lodash');
var Connection = require('ssh2');

function createConfig(userConfig) {
    var env = process.env;

    var config = _.defaults(userConfig || {}, {
        username: env.TUNNELSSH_USER || env.USER || env.USERNAME,
        sshPort: 22,
        srcPort: 0,
        srcHost: 'localhost',
        dstPort: null,
        dstHost: 'localhost',
        localHost: 'localhost'

    });
    if (!config.password && !config.privateKey) {
        config.agent = config.agent || process.env.SSH_AUTH_SOCK;
    }

    if (!config.dstPort || !config.dstHost || !config.host) {
        throw new Error('invalid configuration.')
    }

    if (config.localPort === undefined) {
        config.localPort = config.dstPort;
    }

    return config;
}

function bindSSHConnection(config, server, netConnection) {

    var sshConnection = new Connection();
    server.emit('sshConnectionCreated');

    sshConnection.on('ready', function() {
        server.emit('sshConnection', sshConnection, netConnection, server);

        sshConnection.forwardOut(
            config.srcHost,
            config.srcPort,
            config.dstHost,
            config.dstPort, function(err, sshStream) {
                if (err) {
                    server.emit('error', err);
                    return;
                }
                sshStream.once('close', function() {
                    if (!config.keepAlive) {
                        sshConnection.end();
                        netConnection.end();
                        server.close();
                    }
                });
                server.emit('sshStream', sshStream, sshConnection, netConnection, server);
                netConnection.pipe(sshStream).pipe(netConnection);
            });
    });
    return sshConnection;
}

function createListener(server) {
    server._conns = [];
    server.on('sshConnection', function(sshConnection, netConnection, server) {
        server._conns.push(sshConnection, netConnection);
    });
    server.on('close', function() {
        server._conns.forEach(function(connection) {
            connection.end();
        });
    });
    return server;
}

function tunnel(configArgs, callback) {
    var config = createConfig(configArgs);
    var server = net.createServer(function(netConnection) {
        server.emit('netConnection', netConnection, server);
        bindSSHConnection(config, server, netConnection).connect(config);
    });
    return createListener(server).listen(config.localPort, config.localHost, callback);
}

module.exports = tunnel;
