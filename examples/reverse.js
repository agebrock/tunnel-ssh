var tunnel = require('../');

tunnel.reverse({
  host: 'agebrock.com',
  username: 'root',
  dstHost: '0.0.0.0',
  dstPort: 3000,
  localPort: 8000
}, function() {
  console.log(arguments);
});
