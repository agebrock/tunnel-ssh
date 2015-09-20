var net = require('net');
var _ = require('lodash');
var debug = require('debug')('tunnel-ssh');
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

  // Try to use ssh-agent if no auth information was set
  if (!config.password && !config.privateKey) {
    config.agent = config.agent || process.env.SSH_AUTH_SOCK;
  }

  // No local routeing, no remote routing.. exit here
  if (!config.dstPort || !config.dstHost || !config.host) {
    throw new Error('invalid configuration.');
  }

  // Use the same port number local
  if (config.localPort === undefined) {
    config.localPort = config.dstPort;
  }

  return config;
}

function bindSSHConnection(config, server, netConnection) {
  var sshConnection = new Connection();

  sshConnection.on('ready', function() {
    debug('sshConnection:ready');
    server.emit('sshConnection', sshConnection, netConnection, server);

    sshConnection.forwardOut(
    config.srcHost,
    config.srcPort,
    config.dstHost,
    config.dstPort, function(err, sshStream) {
      if (err) {

        if (!config.keepAlive) {
          server.close();
        }
        // Bubble up the error => netConnection => server
        netConnection.emit('error', err);
        debug('Destination port:', err);
        return;
      }
      sshStream.once('close', function() {
        debug('sshStream:close');
        if (!config.keepAlive) {
          server.close();
        } else {
          sshConnection.end();
        }
      });
      debug('sshStream:create');
      netConnection.pipe(sshStream).pipe(netConnection);
      server.emit('sshStream', sshStream, sshConnection, netConnection, server);

    });
  });
  return sshConnection;
}

function createListener(server) {
  var connections = [];

  server.on('sshConnection', function(sshConnection, netConnection) {
    connections.push(sshConnection, netConnection);
  });
  server.on('close', function() {
    connections.forEach(function(connection) {
      connection.end();
    });
  });
  return server;
}

function tunnel(configArgs, callback) {
  var server;

  try {
    var config = createConfig(configArgs);
  } catch (e) {
    return callback(null, e);
  }

  server = net.createServer(function(netConnection) {
    netConnection.on('error', server.emit.bind(server, 'error'));
    server.emit('netConnection', netConnection, server);
    bindSSHConnection(config, server, netConnection).connect(config);
  });

  return createListener(server).listen(config.localPort, config.localHost, callback);
}

module.exports = tunnel;
