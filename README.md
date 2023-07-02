Tunnel-SSH

==========

```bash
ssh -L [LOCAL_IP:]LOCAL_PORT:DESTINATION:DESTINATION_PORT [USER@]SSH_SERVER
```
  

![Tunnel-SSH Logo](http://i.imgur.com/I5PRnDD.jpg)

  
### History and Credits
Once upon a time this package was created to show my colleges how to create and publish a npm package. 
That time we used ssh tunnels on our unix machines on a daily bases, so decided to to do it with node. 
This was about 6 years ago, where javascript was a callback hell. 

Since then this project is pretty much community driven by pull requests and suggestions.


Thank you for your support. 

Special thanks goes to the following brothers in arms:
Tunnel-ssh is based on the fantastic [ssh2](https://github.com/mscdex/ssh2) library by Brian White.

Vlad Barboni for the initial brainstorming.
derekrliang for providing the type definitions.
lenchvolodymyr for the idea of the dynamic port mapping.
  

### Changelog
##### 5.1.0 
* Improved Typescript support
* sshOptions.username default is root
* forwardOptions.dstAddr default to 0.0.0.0 (all interfaces)

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


If port is omitted or is 0, the operating system will assign an arbitrary unused port, which can be retrieved by using server.address().port after the ['listening'](https://nodejs.org/api/net.html#event-listening) event has been emitted.

To use the automatic assigned port in the forwardOptions make sure forwardOptions.srcPort is not defined.




### SSH client options
Options to tell the ssh client how to connect to your remote machine.
For all possible options please refere to the ssh2 documentation:
[ssh2 documentation](https://www.npmjs.com/package/ssh2#installation)
You will find different examples there for using a privateKey, password etc..

## SSH Agent additional information. 
The most common settings for the agent are : 

```js
	// for linux
	{
		host:'myhost.com'
		agent:process.env.SSH_AUTH_SOCK
	}
	// for windows
	{
		agent:'pageant'
	}
	// for windows with unix port (wsl docker
	{
		agent:'\\\\.\\pipe\\openssh-ssh-agent'
	}

```

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

Note: If the srcAddr or srcPort is not defined, the adress will be taken from the local TCP server.
This is usefull if you want to create a tunnel and let the OS decide what port should be used. 

Example:
```js
	const tunnelOptions = {
		autoClose:true
	}

	const sshOptions = {
		host: '192.168.100.100',
		port: 22,
		username: 'frylock',
		password: 'nodejsrules'
	};

	// Here is where the magic happens...
	const serverOptions = null; // automatic assign port by OS
	
	// Note that the forwarding options does not define the srcAddr and srcPort here.
	// to use the server configuration. 
	const forwardOptions = {
		dstAddr:'127.0.0.1',
		dstPort:27017
	}
	

    let [server, client] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
 
	// Example how to get the server port information.
    console.log(`server listen on ${server.address().port}`)
```


### API

Tunnel-SSH exposes currently only  one method: **createTunnel**

```js
createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
```

## Typescript
Since 5.0.9 we added our own types to the project.
For Typescript we export the configuration objects as well. 
The recommented way of import is as follows:

```Typescript
import {createTunnel, ForwardOptions, ServerOptions, SshOptions} from 'tunnel-ssh';

// please note that the ForwardingOptions, ServerOptions and SshOptions are Types
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

The following example shows how to connect to a remote mongodb and bind it to all local interfaces. 

```js
import {createTunnel} from 'tunnel-ssh';

const port = 27017;

const tunnelOptions = {
	autoClose:true
};
const serverOptions = {
	port: port
};
const sshOptions = {
	host: '192.168.100.100',
	port: 22,
	username: 'frylock',
	password: 'nodejsrules'
};
const forwardOptions = {
	srcAddr:'0.0.0.0',
	srcPort:port,
	dstAddr:'127.0.0.1',
	dstPort:port
};

let [server, conn] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);

server.on('connection', (connection) =>{
    console.log('new connection');
});
```

### Too complicated ?

If you just searching for an easy way to forward a remote port to your local machine try the following:

```js

import {createTunnel} from 'tunnel-ssh';
const sshOptions = {
	host: '192.168.100.100',
	port: 22,
	username: 'frylock',
	password: 'nodejsrules'
};

function mySimpleTunnel(sshOptions, port, autoClose = true){
    let forwardOptions = {
        srcAddr:'127.0.0.1',
        srcPort:port,
        dstAddr:'127.0.0.1',
        dstPort:port
    }

    let tunnelOptions = {
        autoClose:autoClose
    }
    
    let serverOptions = {
        port: port
    }

    return createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
}

await mySimpleTunnel(sshOptions, 27017);

```