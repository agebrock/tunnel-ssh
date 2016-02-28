var tunnel = require('../');


// This is a very handy way to test your next webhook !


// Please set up your /etc/hosts or change the hostname befor
// running the example.


// The name "local" is currently missleading since you can put
// remove ports as well...
var dstPort = 8000;
var host = 'tunneltest.com';

tunnel.reverse({
  host: host,
  username: 'root',
  dstHost: '0.0.0.0', // bind to all interfaces (see hint in the readme)
  dstPort: dstPort,
  //localHost: '127.0.0.1', // default
  //localPort: localPort
}, function(error, clientConnection) {
  console.log(clientConnection._forwarding);
});

require('http').createServer(function(res, res){
  res.end('SSH-TUNNEL: Gate to heaven !');
}).listen(localPort);

console.log('Tunnel created: http://'+host+':'+localPort);
