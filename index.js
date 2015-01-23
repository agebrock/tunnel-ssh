var Connection = require('ssh2');
var net = require('net');


function SSHTunnel(config, callback) {
    var self = this;
    self._verbose = config.verbose || false;
    self._config = config;
    if (callback) {
        self.connect(callback);
    }
}

SSHTunnel.prototype.log = function () {
    if (this._verbose) {
        console.log.apply(null, arguments);
    }
};

SSHTunnel.prototype.close = function (callback) {
    var self = this;
    this.server.close(function (error) {
        self.connection.end();
        if (callback) {
            callback(error);
        }
    });
};

SSHTunnel.prototype.connect = function (callback) {
    var self = this,
        disabled = self._config.disabled,
        remotePort = self._config.remotePort,
        localPort = self._config.localPort,
        remoteHost = self._config.remoteHost || '127.0.0.1',
        onReady = self._config.onReady,
        onError = self._config.onError,
        onClose = self._config.onClose,
        onEnd = self._config.onEnd;
        
    callback = callback || function(err){
        if (err) {self.log(err);}
        else { if (typeof onReady == 'function') onReady(); }
    };

    if(disabled){
        return callback(null);
    }
    var c = self.connection = new Connection();

    c.on('ready', function () {
        self.log("Connected "+self._config.sshConfig.host+":"+remotePort+" to local port "+localPort);

        self.server = net.createServer(function (connection) {
            var buffers = [];

            var addBuffer = function (data) {
                buffers.push(data);
            };

            connection.on('data', addBuffer);

            c.forwardOut('', 0, remoteHost, remotePort, function (error, ssh) {
                if (error){
                    // close connection
                    connection.removeAllListeners();
                    connection.end();

                    c.emit('error', error);
                    return;
                }

                while (buffers.length) {
                    ssh.write(buffers.shift());
                }
                connection.removeListener('data', addBuffer);

                ssh.on('data', function (buf) {
                    connection.write(buf);
                });
                connection.on('data', function (buf) {
                    ssh.write(buf);
                });
                connection.on('end', function () {
                    self.log('connection::end');
                    ssh.removeAllListeners();
                    ssh.end();
                });
                ssh.on('end', function () {
                    self.log('ssh::end');
                    connection.removeAllListeners();
                    connection.end();
                });
            });
        });
        self.server.listen(localPort, callback);

        // handle error when self.server.listen fails (e.g. port is already used)
        self.server.on('error', function(err){
            callback(err);
            if (typeof onError == 'function') onError(err);
            self.connection.end();
        });
    });

    c.on('error', function (err) {
        self.log('ssh2::error:: ' + err);
        if (typeof onError == 'function') onError(err);
        callback(err);
    });
    c.on('end', function () {
        if (typeof onEnd == 'function') onEnd();
        self.log('ssh2::end');
    });
    c.on('close', function (err) {
        if (typeof onClose == 'function') onClose();
        self.log('ssh2::close');
    });

    c.connect(self._config.sshConfig);
};

module.exports = SSHTunnel;
