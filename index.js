var Promise = require('bluebird');
var config = require('./lib/config');
var createTunnel = Promise.promisify(require('./lib/tunnel').createTunnel);


var tunnel = function(rawConfig, callback) {

  return config
    .init(rawConfig)
    .then(createTunnel)
    .then(function(server) {
      if (callback) {
        server
          .on('error', callback)
          .on('ready', callback.bind(null, null));
      }
      return server;
    });
};


var setup = function(cfg) {
  var userConfig = config.load(cfg);

  return require('./lib/net')(tunnel, userConfig);
};

exports.tunnel = tunnel;
exports.setup = setup;
