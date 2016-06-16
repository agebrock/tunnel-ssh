var tunnel = require('../');
var net = require('net');
var debug = require('debug')('tunnel-ssh:test');

// Keep alive example
// this example demonstrates the keepAlive option.
// keepAlive will reuse the connections
// note the "tunnelKeepAlive.close();" at the end.
// this step is required to finish execution nicely

var config = {
  host: '93.180.157.151',
  username: 'root',
  dstPort: 80,
  dstHost: '10.1.16.119',
  localPort: 8000
};

tunnel(config, function() {
  console.log('Tunnel open');
}).on('error', function(e) {
  console.log('error', e);
});
