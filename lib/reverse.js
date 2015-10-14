var Client = require('ssh2').Client;
var Socket = require('net').Socket;
var createConfig = require('./config');
var debug = require('debug');

function createClient(userConfig, callback) {
  var config = createConfig(userConfig);

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
      console.log('Listening for connections on server on port ' + remotePort + '!');
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
        callback(null, true);
      } else {
        callback(errors, null);
      }
    });

  });
  return conn.connect(config);
};

module.exports = createClient;

