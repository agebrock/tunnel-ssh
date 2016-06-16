var defaults = require('lodash.defaults');

function createConfig(userConfig) {
  var env = process.env;
  var config = userConfig || {};

  defaults(config, {
    username: env.TUNNELSSH_USER || env.USER || env.USERNAME,
    port: 22,
    srcPort: 0,
    srcHost: 'localhost',
    dstPort: null,
    dstHost: config.host,
    host: config.dstHost,
    localHost: null,
    localPort: null
  });

  // Try to use ssh-agent if no auth information was set
  if (!config.password && !config.privateKey) {
    config.agent = config.agent || process.env.SSH_AUTH_SOCK;
  }

  // No local route, no remote route.. exit here
  if (!config.dstPort || !config.dstHost || !config.host) {
    throw new Error('invalid configuration.');
  }

  // Use the same port number local
  if (config.localPort === undefined) {
    config.localPort = config.dstPort;
  }

  return config;
};

module.exports = createConfig;
