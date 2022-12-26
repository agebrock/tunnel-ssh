Tunnel-SSH

==========

  

One to connect them all !

  

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

  

Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.
  

### Latest Release 5.0.0

  

### Breaking change in 5.0.0

Please note that release 5.0.0 uses a complete different approch for configuration and is not compatible to prio versions.

#### New Features
* Reuse of ssh client instead of creating a new one for each connection
* Promise / Async Await support

## Concept

Tunnel-ssh v5 is designed to be very extendable and does not provide as much sematic sugar as prio versions.

The design goal was to use the original settings for each part used in the project to be able to use all possible binding features from client and server.

The configuration is separated in the following parts:

* Tunnel server
* TCP Server
* SSH Client
* SSH Forwarding

### Tunnel Server Options

This configuration controls be behaviour of the tunnel server.
Currently there is only one option available.

Example:

```js
const tunnelOptions = {
	autoClose:true
}
```

*autoclose* - closes the Tunnel-Server once all clients disconnect from the server.
Its useful for tooling or scripts that require a temporary ssh tunnel to operate.
For example a mongodump.

Set this option to **false** will keep the server alive until you close it manually.

### TCP Server options

Controls the behaviour of the tcp server on your local machine. 
For all possible options please refere to the official node.js documentation: 
[ServerListenOptions](https://nodejs.org/api/net.html#serverlistenoptions-callback)

Example:

```js
const serverOptions = {
	host:'127.0.0.1',
	port: 27017
}
```


### SSH client options
Options to tell the ssh client how to connect to your remote machine.
For all possible options please refere to the ssh2 documentation:
[ssh2 documentation](https://www.npmjs.com/package/ssh2#installation)
You will find different examples there for using a privateKey, password etc..

Example:

```js
const sshOptions = {
	host: '192.168.100.100',
	port: 22,
	username: 'frylock',
	password: 'nodejsrules'
};
```

### SSH Forwarding options
Options to control the source and destination of the tunnel. 

Example:

```js
const forwardOptions = {
	srcAddr:'0.0.0.0',
	srcPort:27017,
	dstAddr:'127.0.0.1',
	dstPort:27017
}
```


### API

Tunnel-SSH exposes currently only  one method: **createTunnel**

```js
createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
```

The method retuns a promise containing the server and ssh-client instance. For most cases you will not need those instances. But in case you want to extend the functionallity you can use them to 
bind to there events like that: 

```js
createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions).
then(([server, conn], error)=>{

    server.on('error',(e)=>{
        console.log(e);
    });

    conn.on('error',(e)=>{
        console.log(e);
    });
});
```

For a list of all possible Events please refere to the node.js documentation for the server and the ssh2 documentation for the client.


### Usage Example
```js
const { createTunnel } = require('tunnel-ssh');
const tunnelOptions = {
	autoClose:true
};
const serverOptions = {
	port: 27017
};
const sshOptions = {
	host: '192.168.100.100',
	port: 22,
	username: 'frylock',
	password: 'nodejsrules'
};
const forwardOptions = {
	srcAddr:'0.0.0.0',
	srcPort:27017,
	dstAddr:'127.0.0.1',
	dstPort:27017
};

[server, conn] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);

server.on('connection', (connection) =>{
    console.log('new connection');
});
```