Tunnel-SSH
==========

This is a public test of the upcoming release 1.0.0


## Examples ##

See the examples for further configuration options.

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

## Roadmap ##
 - project based config via ENV
 - auto reconnect after disconnect
