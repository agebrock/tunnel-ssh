var debug = require('debug')('tunnel.index');
var Promise = require('bluebird');

var config = require('./lib/config');

var createTunnel = require('./lib/tunnel').createTunnel;

createTunnel = Promise.promisify(createTunnel);

exports.tunnel = function(rawConfig, callback) {
  var userConfig = config.prepare(rawConfig);
  var tunnel = createTunnel(userConfig);

  tunnel.then(function(tunnel) {
    tunnel.config = userConfig;

    if (callback) {
      callback(null, tunnel);
    }

    return tunnel;
  }).catch(function(e) {
    if (callback) {
      callback(e);
    } else {
      throw e;
    }
  });
  return tunnel;
};
exports.tunnelAsync = function(rawConfig, callback) {
  return config.init(rawConfig).then(function(userConfig) {
    var tunnel = createTunnel(userConfig).then(function(tunnel) {
      tunnel.config = userConfig;

      if (callback) {
        callback(null, tunnel);
      }

      return tunnel;
    }).catch(function(e) {
      if (callback) {
        callback(e);
      } else {
        throw e;
      }
    });
    return tunnel;
  });
};

exports.reverseTunnel = require('./lib/reverse').createTunnel;
exports.patchNet = function(cfg) {
  var userConfig = config.load(cfg);

  require('./lib/net')(userConfig);
};
