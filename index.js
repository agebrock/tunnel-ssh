var net = require('net');
var debug = require('debug')('tunnel-ssh');
var Connection = require('ssh2');
var createConfig = require('./lib/config');
var events = require('events');
var noop = function() {
};

function bindSSHConnection(config, netConnection) {
  var sshConnection = new Connection();

  sshConnection.on('ready', function() {
    debug('sshConnection:ready');
    netConnection.emit('sshConnection', sshConnection, netConnection);

    sshConnection.forwardOut(
      config.srcHost,
      config.srcPort,
      config.dstHost,
      config.dstPort, function(err, sshStream) {
        if (err) {
          // Bubble up the error => netConnection => server
          netConnection.emit('error', err);
          debug('Destination port:', err);
          return;
        }
        sshStream.once('close', function() {
          debug('sshStream:close');
          if (config.keepAlive) {
            sshConnection.end();
          }
        });
        debug('sshStream:create');
        netConnection.pipe(sshStream).pipe(netConnection);
        netConnection.emit('sshStream', sshStream);
      });
  });
  return sshConnection;
}

function createServer(config) {
  var server,
      sshConnection,
      connections = [];

  server = net.createServer(function(netConnection) {
    netConnection.on('error', server.emit.bind(server, 'error'));
    server.emit('netConnection', netConnection, server);
    sshConnection = bindSSHConnection(config, netConnection);
    sshConnection.on('error', server.emit.bind(server, 'error'));
    netConnection.on('sshStream', function(sshStream) {
      sshStream.once('close', function() {
        debug('sshStream:close');
        if (!config.keepAlive) {
          server.close();
        }
      });
      sshStream.on('error', function() {
        server.close();
      });
    });
    connections.push(sshConnection, netConnection);
    debug('sshConfig', config);
    sshConnection.connect(config);
  });

  server.on('close', function() {
    connections.forEach(function(connection) {
      connection.end();
    });
  });

  return server;
}

function tunnel(configArgs, callback) {
  var server, config;

  if (!callback) {
    callback = noop;
  }
  try {
    config = createConfig(configArgs);

    server = createServer(config).listen(config.localPort, config.localHost, function(error) {
      callback(error, server);
    });
  } catch (e) {
    server = new events.EventEmitter();
    setImmediate(function() {
      callback(e);
      server.emit('error', e);
    });
  }
  return server;
}

module.exports = tunnel;
