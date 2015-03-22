/**
 *
 * Every object created by the tunnel is emitted through the "server" instance.
 * Every instance event has the same order of object but they differ in length.
 *
 *
 */
var tunnel = require('../');


var config = {
    host: '93.180.157.151',
    username: 'root',
    dstPort: 27017,
    localPort: 3000
};

var server = tunnel(config, function () {
    console.log('connected');
});

/**
 *  the server will emit every object created, arguments are always in the same order.
 */
server.on('sshStream', function (sshStream, sshConnection, netConnection, server) {

    sshStream.on('close', function () {
        console.log('TCP :: CLOSED');
    });
});

server.on('sshConnection', function (sshConnection, netConnection, server) {});

server.on('netConnection',function(netConnection, server){});


