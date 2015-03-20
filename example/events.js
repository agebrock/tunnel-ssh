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
 *  left to right => small to large (server is the biggest / root,  sshStream the smnallest)
 */
server.on('sshStream', function (sshStream, sshConnection, netConnection, server) {

    sshStream.on('close', function () {
        console.log('TCP :: CLOSED');
            netConnection.end();
            server.close();
    });
});


