var net = require('net');
var debug = require('debug')('tunnel.net');
var _ = require('lodash');
var connect = net.Socket.prototype.connect;
var Tunnel = require('../').tunnel;
var cache = {};

// Borrowed from node source (net.js)
function isPipeName(s) {
  return typeof s === 'string' && toNumber(s) === false;
}

// Borrowed from node source (net.js)
function toNumber(x) {
  return (x = Number(x)) >= 0 ? x : false;
}

// Borrowed from node source (net.js)
// Returns an array [options] or [options, cb]
function normalizeConnectArgs(args) {
  var options = {};
  var cb;

  if (args[0] !== null && typeof args[0] === 'object') {
    options = args[0];
  } else if (isPipeName(args[0])) {
    options.path = args[0];
  } else {
    options.port = args[0];
    if (typeof args[1] === 'string') {
      options.host = args[1];
    }
  }
  cb = args[args.length - 1];

  return typeof cb === 'function' ? [options, cb] : [options];
}

function buildKey(obj) {
  if (obj.path) {
    return obj.path;
  }
  return obj.host + ':' + obj.port;
}

module.exports = function(configCollection) {

  debug('inital configuration set !');

  /**
   * Socket connect prototype to use ssh connection
   * Check if config for target is set
   * Start SSH tunnel if not already started
   *
   * @param options
   * @param cb
   * @returns {net.Socket}
   */
  var con = net.Socket.prototype.connect = function(options, cb) {

    // Borrowed from net.js: restart method if normalization is required.
    if (options === null || typeof options !== 'object') {
      var args = normalizeConnectArgs(arguments);

      return con.apply(this, args);
    }

    var self = this;
    var key = buildKey(options);
    var configElement = configCollection[key];

    // Exit if no config was found.
    if (!configElement) {
      debug('Ignore: %s:', key, options);
      return connect.call(self, options, cb);
    }

    if (!cache[key]) {
      debug('Create: %s', key);
      cache[key] = Tunnel(configElement).then(function(tunnel) {
        var tunnelConfig = {
          host: tunnel.config.srcHost,
          port: tunnel.config.srcPort
        };
        console.log('WORKS2');
        tunnel.on('close', function() {
          debug('remove tunnel');
          delete cache[key]
          ;
        });
        debug('Map: %s => %s', key, buildKey(tunnelConfig));
        connect.call(self, tunnelConfig, cb);
        return tunnel;
      });

    } else {
      cache[key].then(function(tunnel) {
        var tunnelConfig = {
          host: tunnel.config.srcHost,
          port: tunnel.config.srcPort
        };

        debug('Map: %s as %s (cached)', key, buildKey(tunnelConfig));
        connect.call(self, tunnelConfig, cb);
      });
    }

    return self;
  };
};
