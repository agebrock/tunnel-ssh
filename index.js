/**
 * test to connect to mongoDB via ssh2
 **/

var Connection = require('ssh2');
var net = require('net');


function SSHTunnel(config) {
    this._verbose = config.verbose || false;
    this._config = config;
    this._shutdown = false;
}


SSHTunnel.prototype.log = function () {
    if (this._verbose) {
        console.log.apply(null, arguments);
    }
};

SSHTunnel.prototype.end = function () {
    var self = this;
    self._shutdown = true;
    self.connection.end();
};

SSHTunnel.prototype.connect = function (callback) {

    var self = this,
        remotePort = this._config.remotePort,
        localPort = this._config.localPort,
        sshConfig = this._config.sshConfig;

    callback = callback || function () {
    };


    if (self.connection) {
        try {
            self.connection.end();
            self.server.close();
            self.server = null;
        } catch (e) {

            self.log('error close', e);
        }
    }

    var c = self.connection = new Connection();

    c.on('ready', function () {
        //console.log('Connection :: ready');
        c.forwardOut('127.0.0.1', remotePort, '127.0.0.1', remotePort, function (error, stream) {
            if (error) {
                return callback(error);
            }

            stream.on('data', function (data) {
                self.log('TCP :: DATA: ' + data);
            });

            stream.on('error', function (err) {
                self.log('TCP :: ERROR: ' + err);
                self.log('RECONNECTING');
                self.connect();
            });

            stream.on('close', function (had_err) {
                c.end();
            });

            if (self.server) {
                self.server.close();
                self.server = null;
            }
            self.server = net.createServer(function (socket) {
                socket.pipe(stream);
                stream.pipe(socket);
            });

            self.server.listen(localPort, function (error) {
                self.log('listen !');
                if (error) {
                    return callback(error);
                } else {
                    callback(null, self);
                }
            });
        });
    });

    c.on('error', function (err) {
        self.log('Connection :: error :: ' + err);
    });
    c.on('end', function () {
        self.log('Connection :: end');
    });
    c.on('close', function (hadError) {
        self.log('Connection :: close');
        if (self.server) {
            self.server.close();
        }
    });
    c.connect(sshConfig);
}

module.exports = SSHTunnel;
