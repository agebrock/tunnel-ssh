var tunnel = require('../');

tunnel.reverse({
  username: 'root',
  dstHost: '0.0.0.0',
  dstPort: 3000,
  localPort: 8000,
  host: 'fc24.io'
}, function() {
  console.log(arguments);
});
