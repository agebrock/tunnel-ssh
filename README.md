Tunnel-SSH
==========



## Examples ##

See the examples for further configuration options.
The config object is passed to the ssh2 config, 
if you have problems connecting to a server check the [ssh2](https://github.com/mscdex/ssh2)
 docs.

Minimal:
```js
    var tunnel = require('tunnel-ssh');

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

