var net = require('net');
var events = require('events');

// Save a copy from the original
var connect = net.Socket.prototype.connect;
var cache = {};
var debug;

try {
  debug = require('debug')('tunnel.net');
} catch ( e ) {
  debug = function() {
    // noop
  };
}
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


function hasValidConfiguration(options) {
  return options !== null || typeof options === 'object';
}



module.exports = function(tunnel, configCollection) {
  var emitter = new events.EventEmitter();

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
    var self = this;


    // Borrowed from net.js
    // Restart method if normalization is required.
    if (!hasValidConfiguration(options)) {
      var args = normalizeConnectArgs(arguments);

      return con.apply(this, args);
    }


    var key = buildKey(options);
    var configElement = configCollection[key];

    // Exit if no config was found.
    if (!configElement) {
      debug('Ignore: %s:', key, options);
      return connect.call(self, options, cb);
    }

    if (!cache[key]) {
      debug('Create: %s', key);
      cache[key] = tunnel(configElement).then(function(t) {

        var tunnelConfig = {
          host: tunnel.config.srcHost,
          port: tunnel.config.srcPort
        };
        t.on('error', console.log);
        t.on('close', function() {
          debug('remove tunnel');
          delete cache[key];
        });

        debug('Map: %s => %s', key, buildKey(tunnelConfig));
        connect.call(self, tunnelConfig, cb);
        return t;
      });

    } else {
      cache[key].then(function(t) {
        var tunnelConfig = {
          host: t.config.srcHost,
          port: t.config.srcPort
        };

        debug('Map: %s as %s (cached)', key, buildKey(tunnelConfig));
        connect.call(self, tunnelConfig, cb);
        return t;
      });
    }

    return self;
  };

  return emitter;
};

