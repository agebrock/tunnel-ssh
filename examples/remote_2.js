var createServer = require('../').createServer;
var userConfig = {
  username: 'root',
  keepAlive: true,
  srcPort: 3000,
  host: 'www.finanzchef24.de',
  dstPort: '27017'
};

var server = createServer(userConfig);

setTimeout(function() {
  server.close();
}, 2000);
