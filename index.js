/**
 * test to connect to mongoDB via ssh2
 **/

var Connection = require('ssh2');
var net = require('net');


function SSHTunnel(config, callback) {
    var self = this;
    self._verbose = config.verbose || false;
    self._config = config;
    self._shutdown = false;
    if(callback){
        self.connect(callback);
    }
}

SSHTunnel.prototype.create = function (callback) {
    var self = this;
    var remotePort = self._config.remotePort;
    var c = new Connection();
    c.on('ready', function () {
        c.forwardOut('127.0.0.1', remotePort, '127.0.0.1', remotePort, callback);
    });

    c.on('error', function (err) {
        self.log('Connection :: error :: ' + err);
    });
    c.on('end', function () {
        self.log('Connection :: end');
    });
    c.on('close', function (err) {
        self.log('Connection :: close');
        c.end();
    });
    c.connect(self._config.sshConfig);
};

SSHTunnel.prototype.log = function () {
    if (this._verbose) {
        console.log.apply(null, arguments);
    }
};

SSHTunnel.prototype.end = function () {
    var self = this;
    self.server.end();
};

SSHTunnel.prototype.connect = function (callback) {
    var self = this;
    self.server = net.createServer(function (connection) {
        self.create(function(error, stream){
            connection.pipe(stream);
            stream.pipe(connection);

            stream.on('data', function (data) {
                self.log('TCP :: DATA: ' + data);
            });

            stream.on('error', function (err) {
                self.log('TCP :: ERROR: ' + err);
                self.log('RECONNECTING');
            });

            stream.on('close', function (err) {
                console.log('STREAM::close');
            });
        });
    });
    self.server.listen(self._config.localPort, callback);
};

module.exports = SSHTunnel;
