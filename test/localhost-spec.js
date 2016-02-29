var createTunnel = require('../').tunnel;
var helper = require('./server');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var debug = require('debug')('test');
var Promise = require('bluebird');
chai.use(chaiAsPromised);

var expect = chai.expect;

var config = {
  host: '127.0.0.1',
  username: process.env.USER,
  dstPort: 8000,
  srcPort: 5000
};

var state = {
  server: null
}
var server;
var tunnel;


describe('localhost', function() {
  var i = 1;

  beforeEach(function() {
    i++;
    config = {
      dstPort: 8000,
      srcPort: 5000 + i
    };

  });

  afterEach(function(done) {
    if (state.tunnel) {
      state.tunnel.close();
      delete state.tunnel;
    }

    if (state.server) {
      state.server.close(function() {
        done();
      });
      delete state.server;
    } else {
      setImmediate(done);
    }
  });

  it('map local port 5000 => 8000', function(done) {
    state.server = helper.createServer(config.dstPort, '127.0.0.1', function() {

      return createTunnel(config).then(function(tunnel) {
        tunnel.once('close', done);
        return expect(helper.request(config.srcPort, '127.0.0.1', 'redirect')).to.eventually.eql('127.0.0.1:8000:redirect');
      });
    });
  });

  it('should autoclose after timeout', function(done) {

    state.server = helper.createServer(config.dstPort, '127.0.0.1', function() {
      debug('server created', config);
      return createTunnel(config).then(function(tunnel) {
        debug('tunnel open');
        return helper.request(config.srcPort, '127.0.0.1', 'first').then(function() {
          debug('done')
          return new Promise(function(resolve) {
            setTimeout(function() {
              debug('timeout');
              resolve(true);
            }, 100);
          }).then(function() {
            return expect(helper.request(config.srcPort, '127.0.0.1', 'second')).to.eventually.be.rejected.notify(done);
          });
        });
      });
    });

  });

  it('(keepAlive=true),  should NOT autoclose', function(done) {
    config.keepAlive = true;
    state.server = helper.createServer(config.dstPort, '127.0.0.1', function() {
      debug('server on');
      return createTunnel(config).then(function(tunnel) {
        helper.request(config.srcPort, '127.0.0.1', 'first')
        helper.request(config.srcPort, '127.0.0.1', 'first')
        helper.request(config.srcPort, '127.0.0.1', 'first');

        return new Promise(function(resolve) {
          resolve({})
        }).delay(150).then(function() {
          return Promise.all([
            helper.request(config.srcPort, '127.0.0.1', 'first2'),
            helper.request(config.srcPort, '127.0.0.1', 'first2'),
            helper.request(config.srcPort, '127.0.0.1', 'first2')
          ]);
        }).delay(50).then(function() {
          return Promise.all([
            helper.request(config.srcPort, '127.0.0.1', 'first2'),
            helper.request(config.srcPort, '127.0.0.1', 'first2'),
            helper.request(config.srcPort, '127.0.0.1', 'first2')
          ]);
        }).then(function() {
          state.tunnel = tunnel;
          done();
        });

      });
    });
  });

  it('(set timeout),  should wait a little before autoclose', function(done) {
    config.timeout = 20;
    state.server = helper.createServer(config.dstPort, '127.0.0.1', function() {
      createTunnel(config).then(function(tunnel) {
        tunnel.once('close', done);
        helper.request(config.srcPort, '127.0.0.1', 'first').then(function() {
          setTimeout(function() {
            expect(helper.request(config.srcPort, '127.0.0.1', 'second')).to.eventually.eql('127.0.0.1:8000:second');
          }, 10);
        });
      });
    });

  });

  it('should close the tunnel', function(done) {
    config.keepAlive = true;
    state.server = helper.createServer(config.dstPort, '127.0.0.1', function() {
      createTunnel(config).then(function(tunnel) {
        return helper.request(config.srcPort, '127.0.0.1', 'first').then(function() {
          tunnel.close();
          return expect(helper.request(config.srcPort, '127.0.0.1', 'second')).to.eventually.be.rejected.notify(done)
        });
      });
    });
  });


});
