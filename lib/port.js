var Socket = require('net').Socket;
var Promise = require('bluebird');
var basePort = 3000;

function scan(resolve) {
  var port = basePort++;
  var config = {port: port, host: '127.0.0.1'};
  var socket = new Socket();

  socket.once('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      socket.result = port;
    }
  }).once('connect', function() {
    socket.result = false;
    socket.end();
  }).once('close', function() {
    if (!socket.result) {
      scan(resolve);
    } else {
      resolve(socket.result);
    }
  });
  socket.connect(config);
}
module.exports = function(overwritePort) {
  if (overwritePort) {
    return Promise.resolve(overwritePort);
  }
  return new Promise(scan);
};
