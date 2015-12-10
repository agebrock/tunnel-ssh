var Client = require('ssh2').Client;
var Socket = require('net').Socket;
var cfg = require('./config');
var debug = require('debug');

function createTunnel(userConfig, callback) {
  return cfg.setReverseDefaults(userConfig).then(function(config) {
    var conn = new Client();
    var errors = [];

    conn.on('ready', function() {
      conn.forwardIn(config.dstHost, config.dstPort, function(err) {
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

      local.connect(config.srcPort, config.srcHost, function() {
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
  });
};

exports.createTunnel = createTunnel;

