var tunnel = require('../').tunnel;

tunnel({}).catch(console.log);

tunnel({}, function(error, tunnel) {
  console.log(arguments);
});
