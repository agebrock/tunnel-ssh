var net = require('net');
var debug = require('debug')('ssh-tunnel:test');
var Promise = require('Bluebird');

var i = 0;
function createServer(port, addr, callback) {
  var x = i++;
  var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
      debug('write:%o', data.toString());
      socket.write(addr + ':' + port + ':' + data);
    });
  }).listen(port, addr, callback);

  server.on('close', function() {
    debug('server::close:' + x);
  });

  server.unref();
  return server;
}

function createClient(port, addr, callback) {
  var client = new net.Socket();

  client.on('error', function(e) {
    return callback(e);
  });

  client.connect(port, addr, function() {
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
      resolve(data.toString());
    });

    client.connect(port, addr, function() {
      client.write(message);
    });

  });
}
exports.request = request;
exports.createServer = createServer;
exports.createClient = createClient;
