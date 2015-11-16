var net = require('net');
var createServer = require('../').createServer;
var createPipe = require('../').createPipe;
var debug = require('debug')('tunnel-ssh');
var config = require('./config');
var _ = require('lodash');
var Promise = require('bluebird');
var scan = Promise.promisify(require('./portscan'));
var settings = require('rc')('tunnel-ssh', {});

var tunnelconfig = _.transform(settings, function(obj, value, key) {
  if (value.host && value.dstPort) {
    obj[value.host + ':' + value.dstPort] = scan().then(function(port) {
      value.srcPort = port;
      value.srcHost = '127.0.0.1';
      delete obj[key];
      return value;
    });

  }
});

var connect = net.Socket.prototype.connect;
var serverConnections = {};

net.Socket.prototype.connect = function(options, cb) {
  var self = this;

  var key = options.host + ':' + options.port;

  if (tunnelconfig[key]) {
    tunnelconfig[key].then(function(config) {
      options.host = config.srcHost;
      options.port = config.srcPort;
      if (!serverConnections[key]) {
        serverConnections[key] = createServer(config);
        serverConnections[key].on('close', function() {
          delete serverConnections[key];
        });
      }
      return serverConnections[key].promise.then(function() {
        connect.call(self, options, cb);
      });
    });

  } else {
    connect.call(self, options, cb);
  }

  return self;
};


