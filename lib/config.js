var _ = require('lodash');

function createConfig(userConfig) {
  var env = process.env;

  var config = _.defaults(userConfig || {}, {
    username: env.TUNNELSSH_USER || env.USER || env.USERNAME || 'root',
    sshPort: 22,
    srcPort: 0,
    srcHost: 'localhost',
    dstPort: userConfig.port || null,
    dstHost: userConfig.host || 'localhost',
    localHost: 'localhost'
  });

  // Try to use ssh-agent if no auth information was set
  if (!config.password && !config.privateKey) {
    config.agent = config.agent || process.env.SSH_AUTH_SOCK;
  }

  // No local route, no remote route.. exit here
  if (!config.dstPort || !config.dstHost) {
    throw new Error('invalid configuration.');
  }

  // Use the same port number local
  if (config.srcPort === undefined) {
    config.srcPort = config.dstPort;
  }


  return config;
};

module.exports = createConfig;
