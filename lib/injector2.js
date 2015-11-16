var net = require('net');
var debug = require('debug')('tunnel-ssh');
var Connection = require('ssh2').Client;
var config = require('./config');
var _ = require('lodash');
var Promise = require('bluebird');
var scan = Promise.promisify(require('./portscan'));
var settings = require('rc')('tunnel-ssh', {});

var promiseList = [];
var tunnelconfig = _.transform(settings, function(obj, value, key) {
  var promise;

  if (value.host && value.dstPort) {
    value.keepAlive = true;
    promise = scan().then(function(port) {
      var settings = _.extend(value, config(value));
      value.srcPort = port;
      value.srcHost = '127.0.0.1';

      obj[value.host + ':' + value.dstPort] = value;
      delete obj[key];
      obj[key] = value;
      value.server = createServer(settings).then(function(service) {
        //value.server = service.server;
      });
      return value.server;
    });
    promiseList.push(promise);

  }
});

function createConnection(callback) {
  var sshConnection = new Connection();

  sshConnection.on('ready', function() {
    callback(null, sshConnection);
  });
  return sshConnection;
}

function getStream(config, sshConnection, callback) {
  sshConnection.forwardOut(config.srcHost, config.srcPort, config.dstHost, config.dstPort, callback);
}

function createServer(settings) {
  var options = {};

  return Promise.fromCallback(function(callback) {
    createConnection(function(error, connection) {
      if (error) {
        return console.error(error);
      }
      var server = net.createServer(options, function(serverStream) {
        getStream(settings, connection, function(error, stream) {
          if (error) {
            return console.error(error);
          }
          serverStream.pipe(stream).pipe(serverStream);
        });
      }).listen(settings.srcPort, settings.srcHost, function(error) {
        callback(error, {
          settings: settings,
          server: server
        });
      });

    }).connect(settings);
  });
}

var originalConnection = net.createConnection;

net.createConnection = function(port, host) {
  var key = host + ':' + port;

  if (tunnelconfig[key]) {
    var socket = new net.Socket();

    host = tunnelconfig[key].srcHost;
    port = tunnelconfig[key].srcPort;
    socket.connect(port, host);
    return socket;
  } else {
    return originalConnection(port, host);
  }

}


