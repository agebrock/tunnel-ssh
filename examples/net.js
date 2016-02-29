require('../').setup({
    "tunneltest.com:27017": {
        username: "root"
    }
});

var mongojs = require('mongojs');
var i = 200;

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

