var net = require('net');
var debug = require('debug')('tunnel-ssh');
var Connection = require('ssh2').Client;
var config = require('./lib/config');
var Promise = require('bluebird');

function createConnection(callback) {
  var sshConnection = new Connection();

  sshConnection.connectionCount = 0;

  sshConnection.promise = new Promise(function(resolve, reject) {
    sshConnection.once('ready', resolve.bind(null, sshConnection));
    sshConnection.once('error', reject);
    return sshConnection;
  });

  if (callback) {
    sshConnection.once('ready', callback.bind(null, sshConnection));
  }

  sshConnection.out = function(config) {
    return sshConnection.promise.then(forwardOut(config, sshConnection));
  };

  return sshConnection;
}

function forwardOut(config, sshConnection) {
  return function() {
    return Promise.fromCallback(function(callback) {
      sshConnection.forwardOut(config.srcHost, config.srcPort, config.dstHost, config.dstPort, callback);
    });
  };
}

function createServer(userConfig) {
  var settings = config(userConfig);
  var connection = createConnection();

  var server = net.createServer(function(ioStream) {
    connection.out(settings).then(function(stream) {
      connection.connectionCount++;

      ioStream.pipe(stream).pipe(ioStream).on('end', function() {
        connection.connectionCount--;
        if (connection.connectionCount === 0 && !settings.keepAlive) {
          connection.end();
        }
      });
    });
  });

  connection.on('end', server.close.bind(server));
  server.on('close', connection.end.bind(connection));

  server.promise = Promise.fromCallback(function(callback) {
    server.listen(settings.srcPort, settings.srcHost, callback);
  });

  connection.connect(settings);
  return server;
}

exports.createServer = createServer;
exports.createConnection = createConnection;
exports.patchNet = function() {
  require('./lib/net');
}
