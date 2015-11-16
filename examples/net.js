require('../').patchNet();

var mongojs = require('mongojs');

var db = mongojs('www.finanzchef24.de/fc24');

db.collection('forms').findOne({}, function(){
  console.log(arguments);
  db.close();
});




