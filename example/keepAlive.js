'use strict';

// Example keepAlive
// =================
// USE the option keepAlive to kepp the tunnel open to reconnect
// or connect with more than one connections through the tunnel.
// You need to shutdown the server by calling the tunnel.close method.


var tunnel = require('../');
var net = require('net');


var configA = {
    host: '127.0.0.1',
    username: process.env.USER,
    dstPort: 8000,
    localPort: 7000,
    // use keepAlive:true to keep the tunnel open.
    keepAlive:true
};

function createClient(port) {
    var client = new net.Socket();
    client.connect(port, '127.0.0.1', function () {
        client.write('alive !');
        setTimeout(function () {
            client.end();
        },1000);
    });
    return client;
}

var tunnelA = tunnel(configA, function () {
    console.log('Tunnel open');
    createClient(7000).on('close', function () {
        createClient(7000).on('close', function () {
            createClient(7000).on('close', function () {
                setTimeout(function () {
                        // Call tunnel.close() to shutdown the server.
                        tunnelA.close();
                    },2000);
            });
        });
    });
});
