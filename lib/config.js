var _ = require('lodash');
var rc = require('rc');
var debug = require('debug')('tunnel.config');
var localport = require('./port');

function load(cfg) {
  var settings = rc('tunnel-ssh', cfg || {});
  var userConfig;

  settings = _.omit(settings, 'configs', 'config', '_');
  userConfig = _.reduce(settings, function(obj, value, key) {
    _.defaults(value, _.zipObject(['host', 'dstPort'], key.split(':')));
    obj[key] = value;
    return obj;
  }, {});
  return userConfig;
}

function parse(userConfig) {
  if (_.isString(userConfig)) {
    var parts = userConfig.split(/[:,@]/g);

    userConfig = _.zipObject(['username', 'host', 'port'].splice(3 - parts.length), parts);
  }
  return userConfig;
}

function setReverseDefaults(userconfig) {
  var config = _.defaults(userconfig || {}, {
    dstHost: '0.0.0.0',
    dstPort: userconfig.srcPort || userconfig.port,
    srcHost: '127.0.0.1',
    srcPort: userconfig.port
  });

  delete config.port;

  return setDefaults(config);
}

function setDefaults(userConfig) {

  var env = process.env;
  var excludedProperties = ['port', 'sshHost'];
  var config = _.omit(_.defaults(userConfig, {
    username: env.USER || env.USERNAME || 'root',
    host: userConfig.sshHost || '127.0.0.1',
    port: userConfig.sshPort || 22,
    srcHost: '127.0.0.1',
    srcPort: userConfig.port,
    dstPort: null,
    dstHost: '127.0.0.1',
    agent: env.SSH_AUTH_SOCK
  }), excludedProperties);

  // No local route, no remote route.. exit here
  if (!config.dstPort) {
    debug(config);
    throw new Error('invalid configuration: dstPort not set:' + config.dstPort);
  }

  return config;

}

function generateSrcPort(userConfig) {
  return localport(userConfig.srcPort || userConfig.port).then(function(port) {
    userConfig.srcPort = port;
    return userConfig;
  });
}

function prepare(rawConfig) {
  return setDefaults(parse(rawConfig));
}

function init(rawConfig) {
  return Promise.resolve(rawConfig)
    .then(prepare)
    .then(generateSrcPort)
    .then(function(config) {
      debug('in: %o', rawConfig);
      debug('out: %o', config);
      return config;
    });
}

module.exports = {
  prepare: prepare,
  setDefaults: setDefaults,
  setReverseDefaults: setReverseDefaults,
  load: load,
  parse: parse,
  init: init
};
