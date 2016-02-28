var Client = require('ssh2').Client;
var Socket = require('net').Socket;
var debug = require('debug');

function createClient(config, callback) {

  var remoteHost = config.dstHost;
  var remotePort = config.dstPort;
  var localHost = config.localHost;
  var localPort = config.localPort;

  var conn = new Client();
  var errors = [];

  conn.on('ready', function() {
    conn.forwardIn(remoteHost, remotePort, function(err) {
      if (err) {
        errors.push(err);
        throw err;
      }
    });
  });

  conn.on('tcp connection', function(info, accept, reject) {
    var remote;
    var local = new Socket();

    debug('tcp connection', info);
    local.on('error', function(err) {
      errors.push(err);
      if (remote === undefined) {
        reject();
      } else {
        remote.end();
      }
    });

    local.connect(localPort, localHost, function() {
      remote = accept();
      debug('accept remote connection');
      local.pipe(remote).pipe(local);
      if (errors.length === 0) {
        callback(null, conn);
      } else {
        callback(errors, null);
      }
    });

  });
  return conn.connect(config);
}

module.exports = createClient;

