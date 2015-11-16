require('../lib/injector2');

var mongojs = require('mongojs');

var cursor = mongojs('stage.finanzchef24.de/fc24').collection('forms');



  cursor.findOne({}, console.log);




