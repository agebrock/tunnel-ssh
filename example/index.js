var Tunnel = require('../');



var config = {
    remotePort: 27017, //localport
    localPort: 27017, //remoteport
    verbose: true, // dump information to stdout
    sshConfig: { //ssh2 configuration
        host: '<yourRemoteIp>',
        port: 22,
        username: 'root',
        privateKey: require('fs').readFileSync('<pathToKeyFile>'),
        passphrase: 'verySecretString' // option see ssh2 config
    }
};

var x = new Tunnel(config);
x.connect(function (error) {
    console.log(error);
    // start useing the tunnel
    // Bsp. Try mongo shell "#mongo"
});

