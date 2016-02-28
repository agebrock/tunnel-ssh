Tunnel-SSH
==========

One to connect them all !

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.
Trouble ? Please study the ssh2 configuration. 

v2.1.1 Released !
* Server now throws client exceptions see Example below Thx @joshbalfour
* Improved reverse proxy and example 


##So what about next major version ?
With version 3 we will introduce a new feature to enable the developer to use  
tunnel-ssh without wrapping your code, a feature i was asked very often for.
We think we have found a very good solution for that, and we already testing 
the beta in production. 
We want to make next release to be as stable as v2 but way more powerful and 
easy to use. Until then we support both versions.

Keep digging !


## Howto

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

####catch SSH errors that occur outside of setup:
```js
    var tunnel = require('tunnel-ssh');
    //map port from remote 3306 to localhost 3306
    var server = tunnel({host: '172.16.0.8', dstPort: 3306}, function (error, result) {
        //you can start using your resources here. (mongodb, mysql, ....)
        console.log('connected');
    });
    
    server.on('error', function(err){
        console.error('Something bad happened:', err);
    });
```

####Reverse tunnel

The reverse tunnel can be used to bypass network restrictions, 
or to listen to web-hocks on your local machine.

```js
var tunnel = require('../');


// This is a very handy way to test your next web-hook !


// Please set up your /etc/hosts or change the hostname before
// running the example.


// The name "local" is currently misleading since you can put
// remove ports as well...
var dstPort = 8000;
var host = 'tunneltest.com';

tunnel.reverse({
  host: host,
  username: 'root',
  dstHost: '0.0.0.0', // bind to all interfaces (see hint in the readme)
  dstPort: dstPort,
  //localHost: '127.0.0.1', // default
  //localPort: localPort
}, function(error, clientConnection) {
  console.log(clientConnection._forwarding);
});

require('http').createServer(function(res, res){
  res.end('SSH-TUNNEL: Gate to heaven !');
}).listen(localPort);

console.log('Tunnel created: http://'+host+':'+localPort);
```

Pro tip: 
If you plan to expose a local port on a remote machine (external interface) you need to
enable the "GatewayPorts" option in your 'sshd_config'

```sh
# What ports, IPs and protocols we listen for
Port 22
GatewayPorts yes
```



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
