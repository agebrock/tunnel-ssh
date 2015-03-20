Tunnel-SSH
==========

Simple SSH tunneling in node.js

## Install ##
    npm install tunnel-ssh

## Example (connect to remote mongo) ##
    var Tunnel = require('tunnel-ssh');

    var config = {
        remotePort: 27017, //localport
        localPort: 27017, //remoteport
        verbose: true, // dump information to stdout
        disabled: false, //set this to true to disable tunnel (useful to keep architecture for local connections)
        sshConfig: { //ssh2 configuration (https://github.com/mscdex/ssh2)
            host: '<yourRemoteIp>',
            port: 22,
            username: 'root',
            privateKey: require('fs').readFileSync('<pathToKeyFile>'),
            passphrase: 'verySecretString' // option see ssh2 config
        },
        onReady: function() {console.log("Tunnel ready.")},
        onError: function(err) {console.log("Got an error:",err)},
        onClose: function(){console.log("Connection closed.");},
        onEnd: function(){console.log("Connection ended.");}
    };

    var tunnel = new Tunnel(config);
    tunnel.connect(function (error) {
        console.log(error);
        //or start your remote connection here .... 
        //mongoose.connect(...);


        //close tunnel to exit script 
        tunnel.close();
    });
## Example (create a tunnel for mysql) ##
```javascript
    var config = {
        remoteHost: '<mysql server host>', // mysql server host
        remotePort: 3306, // mysql server port
        localPort: 33333, // a available local port
        verbose: true, // dump information to stdout
        disabled: false, //set this to true to disable tunnel (useful to keep architecture for local connections)
        sshConfig: { //ssh2 configuration (https://github.com/mscdex/ssh2)
            host: '<ssh server host>',
            port: 22,
            username: 'root',
            privateKey: require('fs').readFileSync('<pathToKeyFile>'),
            passphrase: 'verySecretString' // option see ssh2 config
        },
        onReady: function() {console.log("Tunnel ready.")},
        onError: function(err) {console.log("Got an error:",err)},
        onClose: function(){console.log("Connection closed.");},
        onEnd: function(){console.log("Connection ended.");}
    };

    var tunnel = new Tunnel(config);
    tunnel.connect(function (error) {
        console.log(error);
        //or start your remote connection here .... 
        //mongoose.connect(...);


        //close tunnel to exit script 
        tunnel.close();
    });
```
mysql config
```javascript
mysql_config = {
    host: '127.0.0.1',
    port: '33333',
    user: 'xxx',
    password: 'xxx'
}
```
