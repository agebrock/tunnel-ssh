var tunnel = require('../');
var net = require('net');
var debug = require('debug')('tunnel-ssh:test');
var helper = require('./server');

// Keep alive example
// this example demonstrates the keepAlive option.
// keepAlive will reuse the connections
// note the "tunnelKeepAlive.close();" at the end.
// this step is required to finish execution nicely

var config = {
  username: 'root',
  keepAlive: true,
  srcHost: '127.0.0.1',
  sshPort: 22,
  srcPort: 27000,
  dstPort: '27017',
  host: 'stage.finanzchef24.de',
  dstHost: 'stage.finanzchef24.de',
  agent: '/var/folders/2n/nk0jb0p93vq067rny2c6_6kh0000gn/T//ssh-A7ML0WSppNMx/agent.28010'
};

var fakeServer = helper.createServer(config.dstPort, '127.0.0.1', function() {

  tunnel(config, function() {
    console.log('Tunnel open');
    var mongojs = require('mongojs');
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);
    mongojs('localhost:27000/fc24').collection('sales').findOne(console.log);

  })
});

fakeServer.unref();
