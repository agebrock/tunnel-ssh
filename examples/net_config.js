require('../').patchNet({
  'foo:27017': {
    host: 'tunneltest.com',
    dstPort: 27017,
    username: 'root'
  }
});

var mongojs = require('mongojs');
var i = 2;

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

