/**
 * @description
 * Simple proxy to tunnel local port 27017 (mongo) to 5000.
 * Try to connect to your mongo via shell:
 * mongo --host 127.0.0.1:5000
 *
 * option.keepAlive
 * will keep the tunnel open until closed via "tunnel.close()"
 *
 */

var helper = require('./server');
var tunnel = require('../').tunnel;
var config = {
  dstPort: 6000,
  srcPort: 5000,
  keepAlive: true
};

helper.createServer(config.dstPort, '127.0.0.1', function() {
  tunnel(config).then(function(t) {
    helper.request(5000, '127.0.0.1', 'hallo tunnel');
    console.log('close tunnel after 2 sec');
    setTimeout(function() {
      console.log('close now');
      t.close();
    }, 2000);
  });
});
