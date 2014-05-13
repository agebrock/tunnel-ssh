Tunnel-SSH
==========

Simple SSH tunneling in node.js

## Install ##
    npm install tunnel-ssh

## Example (connect to remote mongo) ##

    var config = {
        remotePort: 27017, //localport
        localPort: 27017, //remoteport
        verbose: true, // dump information to stdout
        sshConfig: { //ssh2 configuration (https://github.com/mscdex/ssh2)
            host: '<yourRemoteIp>',
            port: 22,
            username: 'root',
            privateKey: require('fs').readFileSync('<pathToKeyFile>'),
            passphrase: 'verySecretString' // option see ssh2 config
        }
    };

    var tunnel = new Tunnel(config);
    tunnel.connect(function (error) {
        console.log(error);
        //or start your remote connection here .... 
        //mongoose.connect(...);


        //close tunnel to exit script 
        tunnel.close();
    });
