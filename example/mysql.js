var tunnel = require('../');

    mysql = require('mysql');


var config = {
    host: '172.16.0.8',
    username: 'fc24',
    dstPort: 3306,
    localPort: 44444
};


var server = tunnel(config, function (error, result) {

    var conn = new mysql.createConnection({
        host: '127.0.0.1',
        port: 44444,
        database: "bi",
        user: "root",
        password: "somePass*"
    });

    conn.end(function(err) {
        console.log("MYSQL::END");
    });
});





server.on('sshStream', function (sshStream, sshConnection, netConnection, server) {
    sshStream.on('close', function () {
        console.log('TCP :: CLOSED');
    }).on('data', function (data) {
        console.log('TCP :: DATA: ');
    });
});


