/**
 * @description
 * Simple proxy to tunnel local port 27017 (mongo) to 5000.
 * Try to connect to your mongo via shell:
 * mongo --host 127.0.0.1:5000
 *
 * tunnel will close if the connection ends, to behave in the
 * same way the script would without any tunnel.
 */
var helper = require('./server');
var tunnel = require('../').tunnel;
var config = {
    dstPort: 6000,
    srcPort: 5000
};

helper.createServer(config.dstPort, '127.0.0.1', function() {
    tunnel(config).then(function(t) {
        console.log(t.config);
        helper.request(5000, '127.0.0.1', 'hallo tunnel');
    });
});
