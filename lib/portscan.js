var Socket = require('net').Socket;
var port = 3000;

function scan(callback) {
  var socket = new Socket();
  var free = null;

  function connect() {
    socket.end();
    socket.destroy();
    free = false;
    ++port;
    return scan(callback);
  }

  function error(e) {
    if (e.code === 'ECONNREFUSED') {
      socket.destroy();
      socket.end();
      free = true;
      var oldPort = port;
      socket.once('close', function() {
        callback(null, oldPort);
      });
      ++port;
      return;
    }
    socket.end();
    socket.destroy();
    return scan(callback);
  }

  function timeout() {
    if (free === null) {
      socket.end();
      socket.destroy();
      return callback(new Error('timeout'), null);
    }
    ++port;
    return scan(callback);
  }

  socket.once('connect', connect)
    .once('timeout', timeout)
    .once('error', error)
    .setTimeout(1000);

  socket.connect(port, '127.0.0.1');
}

module.exports = scan;
