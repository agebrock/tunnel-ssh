var tunnel = require('../').tunnel;
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
  srcPort: 7000,
  timeout: 1000
};

tunnel(config, function(e, t) {
  console.log('ERROR', t);
  helper.createClient(7000, '127.0.0.1', function() {}).on('close', function() {
    helper.createClient(7000, '127.0.0.1', function() {}).on('close', function() {
      helper.createClient(7000, '127.0.0.1', function() {}).on('close', function() {
        var fakeServer = helper.createServer(config.dstPort, '127.0.0.1', function() {
          console.log('server on');
          helper.createClient(7000, '127.0.0.1', function(e, r) {
            console.log(e, r);
          }).on('close', function() {
            console.log('END');
          });
        });

        fakeServer.unref();

      });

    });
  });
});

