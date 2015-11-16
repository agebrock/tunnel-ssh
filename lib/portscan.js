var debug = require('debug')('tunnel-ssh');

var Socket = require('net').Socket;
var port = 3000;

function scan(callback) {
  var socket = new Socket();
  var free = null;

  port++;

  function connect() {
    debug('connect', this.port);
    socket.end();
    return scan(callback);
  }

  function error(e) {
    debug('error',e, this.port);
    socket.end();
    if (e.code === 'ECONNREFUSED') {
      callback(null, this.port);
      return;
    }

    return scan(callback);
  }


  socket.once('connect', connect.bind({port:port}))
    .once('error', error.bind({port:port}));

  socket.connect(port, '127.0.0.1');
}

module.exports = scan;
