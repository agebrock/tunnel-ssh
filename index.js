var net = require('net');
var Connection = require('ssh2');

var env = process.env;
var defaults = {
  username: env.TUNNELSSH_USER || env.USER || env.USERNAME,
  port: 22,
  srcPort: 0,
  srcHost: 'localhost',
  dstPort: null,
  dstHost: 'localhost',
  localHost: 'localhost'
};

function createConfig(userConfig) {  
  var config = Object.create(defaults);
  
  // override defaults
  Object.keys(userConfig).forEach(function (key) {
    config[key] = userConfig[key];
  });
  
  if (!config.password && !config.privateKey) {
    config.agent = config.agent || process.env.SSH_AUTH_SOCK;
  }
  
  if (!config.dstPort || !config.dstHost || !config.host) {
    throw new Error('invalid configuration.');
  }
  
  if (config.localPort === undefined) {
    config.localPort = config.dstPort;
  }
  
  return config;
}

var queue = [];
var queuingConnectListener = function (netConnection) {
  queue.push(netConnection);
};

function bindSSHConnection(config, server) {
  
  var sshConnection = new Connection();
  sshConnection.on('ready', function () {
    server.emit('sshConnection', sshConnection, server);
    
    function onConnection(netConnection) {
      server.emit('netConnection', netConnection, server);
      
      sshConnection.forwardOut(
        config.srcHost,
                config.srcPort,
                config.dstHost,
                config.dstPort, function (err, sshStream) {
          if (err) {
            throw err;
          }
          sshStream.once('close', function () {
            if (!config.keepAlive) {
              netConnection.end();
            }
          });
          server.emit('sshStream', sshStream, sshConnection, netConnection, server);
          netConnection.pipe(sshStream).pipe(netConnection);
        });
    }

    server.on('connection', onConnection);
    server.removeListener('connection', queuingConnectListener);    
    queue.forEach(onConnection);
    queue = [];
  });
  return sshConnection;
}

function tunnel(configArgs, callback) {
  var config = createConfig(configArgs);
  
  var server = net.createServer();
  
  server.on('connection', queuingConnectListener);

  server.listen(config.localPort, config.localHost, function (err) {
    if (err) {
      return callback(err);
    }

    var sshConnection = bindSSHConnection(config, server);
    sshConnection.connect(config);
    sshConnection.on('close', function () {
      server.close();
    });

    return callback();
  });

  return server;
}

module.exports = tunnel;
