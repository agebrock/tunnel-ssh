var tunnel = require('../');
var http = require('http');

tunnel.reverse({
    username: 'root',
    dstHost: '0.0.0.0',
    dstPort: 3000,
    localPort: 3000,
    host: 'addlistener.com'
}, function() {
    console.log(arguments);
});
