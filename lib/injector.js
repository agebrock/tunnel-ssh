var tunnel = require('../');
var Promise = require('bluebird');
var net = require('net');
var _ = require('lodash');
var p = {};
var connections = [];
var localPort = 27000;
var ptunnel = Promise.promisify(tunnel);
var config = require('rc')('tunnel-ssh', {});
var tunnelconfig = _.transform(config, function(obj, value, key) {
  if (value.host && value.port) {
    value.keepAlive = true;
    obj[value.host + ':' + value.port] = value;
    obj[key] = value;
  }
});

function createTunnel(config) {

  return ptunnel(config);
}

var createConnection = net.createConnection;

function setSSHTunnel(config) {
  var key = config.host + ':' + config.port;

  _.defaults(config, {
    keepAlive: true,
    username: 'root'
  });
  config.dstPort = config.port;

  tunnelconfig[key] = config;
}

net.createConnection = function(port, host) {
  var key = host + ':' + port;

  if (!tunnelconfig[key]) {
    return createConnection(port, host);
  }
  var socket = tunnelconfig[key].socket || new net.Socket();

  socket.on('error', function(error) {
    console.log(error);
  });

  var con = {
    socket: socket
  };

  con.name = key;
  con.config = {
    host: host,
    dstPort: port,
    localPort: localPort,
    keepAlive: true,
    username: 'root'
  };
  connections.push(con);

  p[key] = p[key] || createTunnel(con.config);
  p[key].then(function(tunnel) {
    console.log(con.config);
    socket.connect(con.config.localPort, '127.0.0.1');
    p[key].socket = socket;
  });

  return socket;
}

exports.setSSHTunnel = setSSHTunnel;

