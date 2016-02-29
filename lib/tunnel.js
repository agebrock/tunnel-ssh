var net = require('net');
var debug = require('debug')('tunnel');
var Client = require('ssh2').Client;


var aspect = require('./aspect');

function createConnection(config) {
  var client = new Client();

  client.connectionCount = 0;

  client.on('close', function() {
    debug('client::close');
    client.connected = false;
    client.connecting = false;
  });

  /**
   *
   * Ensure a client connection
   */
  function start(callback) {

    if (client.connected) {
      return callback(null, client);
    }

    client.once('ready', function() {
      client.connected = true;
      client.connecting = false;
      return callback(null, client);
    });

    if (!client.connecting) {
      client.connecting = true;
      client.connect(config);
    }
  }

  function decrease() {
    client.connectionCount--;
    client.emit('connectionCountChange', 'decrease', client.connectionCount);
  }

  function increase() {
    client.connectionCount++;
    client.emit('connectionCountChange', 'increase', client.connectionCount);
  }

  function onError(source) {
    return function(e) {

      debug('ERROR @ %s', source);
      debug(e);

    };
  }

  client.createStream = function(options, callback) {
    debug('creating stream');
    options = options || {};
    if (!options.silent) {
      increase();
    }
    return start(function() {
      debug('connect');
      client.forwardOut(
        config.srcHost,
        config.srcPort,
        config.dstHost,
        config.dstPort, function(error, stream) {

          if (error) {
            onError('sshConnection')(error);
            if (!options.silent) {
              decrease();
            } else {
              debug('close client Error:sshConnection');
              if (client.close) {
                client.close();
              }
            }
            return callback(error);
          }
          debug('stream created');
          stream.on('close', function() {
            debug('ssh connection closed');
            if (!options.silent) {
              decrease();
            }
          });
          callback(null, stream);
        });
    });
  };

  client.tunnel = function(ioStream, options) {


    options = options || {};

    debug('creating tunnel..');
    client.createStream(options, function(error, stream) {
      if (error) {
        return onError('stream(tunnel)');
      }

      ioStream
        .pipe(stream)
        .on('error', onError('stream'))

        .pipe(ioStream)
        .on('error', onError('ioStream'));

    });

    return ioStream;

  }.bind(client);
  return client;
}

function createTunnel(userConfig, callback) {
  var client = createConnection(userConfig);
  var server = net.createServer(client.tunnel);

  //aspect.on(client, 'error', server.emit.bind(server, 'error'));
  aspect.on(server, 'close', client.end.bind(client));
  server.config = userConfig;

  client.on('connectionCountChange', function(change, connectionCount) {
    debug('connectionCountChange %d', connectionCount);
    if (connectionCount === 0 && !userConfig.keepAlive) {
      if (userConfig.timeout) {

        setTimeout(function() {
          if (client.connectionCount === 0) {
            debug('closeing server by timeout');
            server.close();
          }
        }, userConfig.timeout);

      } else {
        debug('closeing server');
        server.close();
      }
    }
    server.emit('connectionCountChange', change, connectionCount);
  });

  debug('listen: port:%o host %o', userConfig.srcPort, userConfig.srcHost);
  server.listen(userConfig.srcPort, userConfig.srcHost, function(e) {
    if (e) {
      return callback(e);
    }

    client.createStream({
      silent: true
    }, function(error) {
      if (error) {
        return callback(error);
      } else {
        server.emit('ready', server);
        callback(null, server);
      }
    });

  });
  return server;
}

exports.createTunnel = createTunnel;
exports.createConnection = createConnection;
