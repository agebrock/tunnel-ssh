require('../').patchNet();

var mongojs = require('mongojs');
var i = 10;

function run() {
  var db = mongojs('tunneltest.com/fc24');

  console.time('mongo');
  db.collection('forms').findOne({}, function(e, r) {
    console.timeEnd('mongo');
    db.close();
    i--;
    if (i > 0) {
      console.log('RUN');
      run();
    }
  });
}
run();

