var tunnel = require('../');
var net = require('net');
var debug = require('debug')('tunnel-ssh:test');
var helper = require('./server');

// Keep alive example
// this example demonstrates the keepAlive option.
// keepAlive will reuse the connections
// note the "tunnelKeepAlive.close();" at the end.
// this step is required to finish execution nicely

var config = {
  host: '127.0.0.1',
  username: process.env.USER,
  dstPort: 8000,
  localPort: 7000
};

var fakeServer = helper.createServer(config.dstPort, '127.0.0.1', function() {


  tunnel(config, function() {
    console.log('Tunnel open');
    helper.createClient(7000, '127.0.0.1', console.log);
    helper.createClient(7000, '127.0.0.1', console.log);
  }).on('error', function(e) {
    console.log('error', e);
  });


});
fakeServer.unref();
