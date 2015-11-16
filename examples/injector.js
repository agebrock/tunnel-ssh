require('../').setSSHTunnel();

var mongojs = require('mongojs');
mongojs('www.finanzchef24.de/fc24').collection('sales').findOne(console.log);

