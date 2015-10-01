Tunnel-SSH
==========

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.
Trouble ? Please study the ssh2 configuration. 

v2.0.0 Released !
We're happy to introduce "reverse Tunnel" 


## Howto

Pro tip: 
If you plan to expose a local port on a remote machine you need to
enable the "GatewayPorts" option in your 'sshd_config'

```sh
# What ports, IPs and protocols we listen for
Port 22
GatewayPorts yes
```


####map remote port to localhost:
```js
    var tunnel = require('tunnel-ssh');
    //map port from remote 3306 to localhost 3306
    var server = tunnel({host: '172.16.0.8', dstPort: 3306}, function (error, result) {
        //you can start using your resources here. (mongodb, mysql, ....)
        console.log('connected');
    });
```

####remap remote port to localhost
```js
    // add a localPort for more more control
    var config = {
        host: '172.16.0.8',
        username: 'root',
        dstPort: 3306,
        localPort: 3000
    };
    
    var server = tunnel(config, function (error, result) {
        console.log('connected');
    });
```

You can find more examples here 



tunnel-ssh supports the default ssh2 configuration.
```js
// Or use a full blown ssh2 config, to fit your needs..
{
    username: 'root',
    port: 22,
    srcPort: 0,
    srcHost: 'localhost',
    dstPort: null,
    dstHost: 'localhost',
    localHost: 'localhost'
    agent : process.env.SSH_AUTH_SOCK,
    privateKey:require('fs').readFileSync('/here/is/my/key'),
    password:'secret'
} 

```
