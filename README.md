Tunnel-SSH
==========

One to connect them all !

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.
Trouble ? Please study the ssh2 configuration.

Changelog 4.1.0 / 2016-08-09
==================

  * style: Change codestyle to xo.
  * Refactor: Improved configuration error handling.
  * refactor: clean up examples
  * style: Remove jscs in favor of eslint.
  * doc: Improve examples
  * Merge pull request #42 from kinsi55/master
  * Merge pull request #43 from pedroventura/master
  * doc: Update Readme.md
  * Fix wrong comparison causing localPort to stay "null" if not explicitly defined.
  * Doc: Update Readme.md
  


### related projects
* [If you don't want to wrap a tunnel around your code: inject-tunnel-ssh](https://github.com/agebrock/inject-tunnel-ssh)
* [If you need it the other way around: reverse-tunnel-ssh](https://github.com/agebrock/reverse-tunnel-ssh)

### Integration
By default tunnel-ssh will close the tunnel after a client disconnects, so your cli tools should work in the same way, they do if you connect directly.
If you need the tunnel to stay open, use the "keepAlive:true" option within 
the configuration.


```js

    var config = {
      ...
      keepAlive:true
    };
    
    var tnl = tunnel(config, function(error, tnl){
          yourClient.connect();
          yourClient.disconnect();
          setTimeout(function(){
            // you only need to close the tunnel by yourself if you set the 
            // keepAlive:true option in the configuration !
            tnl.close();
          },2000);  
      });
    
    // you can also close the tunnel from here...
    setTimeout(function(){
      tnl.close();
    },2000);  

```
 

## Understanding the configuration

1. A local server listening for connections to forward via ssh
Description: This is where you bind your interface.
Properties:
** localHost (default is '127.0.0.1')
** localPort (default is dstPort)


2. The ssh configuration 
Description: The host you want to use as ssh-tunnel server.
Properties:
** host
** port (22)
** username
** ...


3. The destination host configuration (based on the ssh host) 
Imagine you just connected to The host you want to connect to. (via host:port)
now that server connects requires a target to tunnel to. 
Properties:
** dstHost (localhost)
** dstPort


### Config example

```js

    var config = {
      username:'root',
      host:sshServer,
      port:22,
      dstHost:destinationServer,
      dstPort:27017,
      localHost:'127.0.0.1',
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
      username:'root',
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
