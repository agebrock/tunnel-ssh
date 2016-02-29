var tunnel = require('../').tunnel;

tunnel({}).catch(function(e) {
  console.log('catched error', e);
});
