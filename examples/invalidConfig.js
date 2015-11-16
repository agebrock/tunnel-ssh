var tunnel = require('../');

var server = tunnel({
  remoteHost: '127.0.0.1',
  remotePort: 3306,
  localPort: 33333,
  verbose: true,
  sshConfig: {
    host: 'REMOTE-IP',
    username: 'USER',
    port: 22
  }
});
