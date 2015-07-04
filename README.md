Tunnel-SSH
==========


## Examples ##

Tunnel-ssh is based on the fantastic 
[ssh2](https://github.com/mscdex/ssh2) library by Brian White.
Tunnel-ssh should do it's job out of the box, but if you ran into any trouble 
connecting to your server. Please study the ssh2 configuration. 

Thx to mrfelton we improved the keepAlive option.
You can use the option to keep the tunnel open.
To shutdown the tunnel in keepAlive mode you need to call 
the "close" Method. Feel free to check the new examples for further information.




Minimal:
```js
    var tunnel = require('tunnel-ssh');
    //map destination Port 3306 to localhost 3306
    var config = {
        host: '172.16.0.8',
        dstPort: 3306
    };
    
    var server = tunnel(config, function (error, result) {
        //you can start using your resources here. (mongodb, mysql, ....)
        console.log('connected');
    });
```

Map local port to 3000

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
    privateKey:'~/.ssh/foo_rsa',
    password:'secret'
} 

```
