var tunnel = require('../').tunnel;
var net = require('net');
var debug = require('debug')('tunnel-ssh:test');
var helper = require('./server');

// Keep alive example
// this example demonstrates the keepAlive option.
// keepAlive will reuse the connections
// note the "tunnelKeepAlive.close();" at the end.
// this step is required to finish execution nicely

var configA = {
  host: '127.0.0.1',
  username: process.env.USER,
  dstPort: 8000,
  srcPort: 7000
};

var x = tunnel(configA);
x.then(function(tunnel) {
  console.log('try 1');
  helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
    console.log('try 2');
    helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
      console.log('try 3');
      helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
        console.log('shutdown');
      });
    });
  });
}).catch(function(e) {
  x.close();
})
