var tunnel = require('../').reverseTunnel;

require('http').createServer(function(req, res) {
  res.end('test');
}).listen(3000);

tunnel({
  username: 'root',
  port: 3000,
  host: 'addlistener.com'
}, function() {
  console.log(arguments);
});

/*
 tunnel({
 username: 'root',
 dstHost: '0.0.0.0',
 dstPort: 3000,
 srcPort: 3000,
 host: 'addlistener.com'
 }, function() {
 console.log(arguments);
 });
 */


