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

server.on('sshStream', function (sshStream, sshConnection, netConnection, server) {
    sshStream.on('close', function () {
        console.log('TCP :: CLOSED');
            netConnection.end();
            server.close();
    });
});


