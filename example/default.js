var tunnel = require('../');
var net = require('net');

var configA = {
    host: '127.0.0.1',
    username: process.env.USER,
    dstPort: 8000,
    localPort: 7000
};


function createClient(port){
      var client = new net.Socket();
    client.connect(port, '127.0.0.1', function() {
        client.write('alive !');
         setTimeout(function(){
            client.end();
        },1000);
     });
    return client;
}


var tunnelA = tunnel(configA, function () {
    console.log('Tunnel open');
    createClient(7000).on('close', function() {
        console.log('Tunnel will close now !');
    });
});
