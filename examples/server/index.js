var net = require('net');
var debug = require('debug')('tunnel-ssh:test-server-client');
var Promise = require('Bluebird');

function createServer(port, addr, callback) {
  var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
      socket.write(addr + ':' + port + ':' + data);
    });
  }).listen(port, addr, callback);

  server.unref();
  return server;
}

function createClient(port, addr, callback) {
  var client = new net.Socket();

  client.on('error', function(e) {
    return callback(e);
  });

  client.connect(port, addr, function(error) {
    if (callback && error) {
      callback(error);
    }
    debug('client::write');
    client.write('OK');
    setTimeout(function() {
      client.end();
      debug('client::end');
      callback(null, true);
    }, 300);
  });
  return client;
}

function request(port, addr, message) {
  return new Promise(function(resolve, reject) {
    var client = new net.Socket();

    client.on('error', function(e) {
      reject(e);
      client.end();
    });

    client.on('data', function(data) {
      client.end();
      debug('client response %s', data.toString());
      resolve(data.toString());
    });

    client.connect(port, addr, function(error) {
      if (error) {
        reject(error);
        client.end();
      } else {
        client.write(message);
      }
    });
  });
}
exports.request = request;
exports.createServer = createServer;
exports.createClient = createClient;
