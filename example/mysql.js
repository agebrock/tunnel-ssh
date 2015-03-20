var tunnel = require('../');



var config = {
    host: '172.16.0.8',
    username: 'root',
    dstPort: 3306
};

var server = tunnel(config, function (error, result) {
    console.log('connected');
});


var i = 0;
server.on('sshStream', function (sshStream, sshConnection, netConnection, server) {
    sshStream.on('close', function () {
        console.log('TCP :: CLOSED');
        console.log(i);
        if(i === 1){
            netConnection.end();
            server.close();
        }
        i++;
    }).on('data', function (data) {
        console.log('TCP :: DATA: ');
    });
});


