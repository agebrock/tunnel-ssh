/**
 * use the usename currently logged in
 * assume localPort to be the same as dstPort  27017 <-> 27017
 *
 */
require('../')({
    host: '93.180.157.151',
    dstPort: 27017
});



var config = _.defaults(userConfig || {}, {
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
});
