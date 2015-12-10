/**
 * @description
 * Simple proxy to tunnel local port 27017 (mongo) to 5000.
 * Try to connect to your mongo via shell:
 * mongo --host 127.0.0.1:5000
 *
 * tunnel will close if the connection ends, to behave in the
 * same way the script would without any tunnel.
 */

var tunnel = require('../').tunnel;
var config = {
  dstPort: 6000, // Port is not open !.
  srcPort: 5000,
  keepAlive: true
};

tunnel(config).then(function(t) {
  t.on('error', console.log);
  console.log(t.config);
}).catch(function(e) {
  console.log('ERROR:', e);
});
