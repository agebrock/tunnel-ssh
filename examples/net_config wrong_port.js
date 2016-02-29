var tunnel = require('../');

var t = tunnel.setup({
  'foo:27017': {
    host: 'tunneltest.com',
    dstPort: 27010, // not listening on that port
    username: 'root'
  }
});

t.on('error', function(e) {
  console.log('Some Error: ', e.message);
});


var mongojs = require('mongojs');
var i = 20;

function run() {

  var db = mongojs('foo/fc24');
  console.time('mongo');
  db.collection('forms').findOne({}, function() {
    console.timeEnd('mongo');
    console.time('mongo2');
    console.log(arguments);
    db.collection('forms').findOne({}, function() {
      console.timeEnd('mongo2');
      console.log(arguments);
      db.close();
      i--;
      if (i > 0) {
        console.log('RUN');
        run();
      }
    });
  });
}
run();

