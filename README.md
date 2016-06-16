Tunnel-SSH
==========

One to connect them all !

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.
Trouble ? Please study the ssh2 configuration.

v4
API Changes:
* API now supports node callback style.   
* Removed reverse proxy in favor of tunnel-ssh-reverse
* Improved docs

##What happend to v3
v3 had a cool feature which allowed us to create a tunnel on demand by hacking the net api.
That feature will be released on a higher level in a different module very soon. 

## Basic understanding
tunnel-ssh requires three hosts to be setup. 

1. The host you want to connect to. (dstHost:dstPort)
Usually the host/port is protected by vpn or firewall

2. The host you want to connect from. (host:port)
This is the host you connect via ssh

3. The host you run the tunnel from. (localHost:localPort)
This is the host you connect via client

### Config example

```js

    var config = {
      user:'root',
      host:sshServer,
      port:22,
      dstHost:destinationServer,
      dstPort:27017
      localHost:'127.0.0.1'
      localPort: 27000
    };
    
    var tunnel = require('tunnel-ssh');
    tunnel(config, function (error, server) {
      //....
    });
```
#### Sugar configuration

In many cases host 1. and 2. are the same, for example if you want to connect to a database
where the port from that database is bound to a local interface (127.0.0.1:27017)
but you are able to connect via ssh (port 22 by default).
You can skip the "dstHost" or the "host" configuration if they are the same.
You can also skip the local configuration if you want to connect to localhost and 
the same port as "dstPort".

```js
    var config = {
      user:'root',
      dstHost:destinationServer,
      dstPort:27017
    };
    
    var tunnel = require('tunnel-ssh');
    tunnel(config, function (error, server) {
      //....
    });
```

#### More configuration options
tunnel-ssh pipes the configuration direct into the ssh2 library so every config option
provided by ssh2 still works. 

Common examples are:
```js
    
    var config = {
      agent : process.env.SSH_AUTH_SOCK, // enabled by default
      privateKey:require('fs').readFileSync('/here/is/my/key'),
      password:'secret'
    }
    
```
    
####catch errors:
```js
    var tunnel = require('tunnel-ssh');
    //map port from remote 3306 to localhost 3306
    var server = tunnel({host: '172.16.0.8', dstPort: 3306}, function (error, server) {
       if(error){
        //catch configuration and startup errors here.
       }
    });

    // Use a listener to handle errors outside the callback
    server.on('error', function(err){
        console.error('Something bad happened:', err);
    });
```
