require('../').setup({
  '127.0.0.1:27017': {
    host: 'tunneltest.com',
    dstPort: 27017,
    username: 'root'
  }
});

var mongojs = require('mongojs');
var i = 2;
var db = mongojs('fc24');

function run() {

  console.time('mongo' + i);
  db.collection('forms').findOne({}, function() {
    console.timeEnd('mongo' + i);
    console.time('mongo2' + i);
    db.collection('forms').findOne({}, function() {
      console.timeEnd('mongo2' + i);
      i--;
      if (i > 0) {
        console.log('RUN');
        run();
      } else {
        db.close();
      }
    });
  });
}
run();

