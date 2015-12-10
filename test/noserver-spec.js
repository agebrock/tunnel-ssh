var createTunnel = require('../').tunnel;
var helper = require('./server');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = chai.expect;

var config = {
  host: '127.0.0.1',
  username: process.env.USER,
  dstPort: 8000,
  srcPort: 5000
};
var server;
var tunnel;
var proxyquire = require('proxyquire');
function foo() {
  describe.off('localhost', function() {

    beforeEach(function(done) {
      config = {
        host: '127.0.0.1',
        username: process.env.USER,
        dstPort: 8000,
        srcPort: 5000
      };
      tunnel = createTunnel(config, done);
    });

    afterEach(function(done) {
      tunnel.close();
    });

    it('should close the tunnel even if error happen', function(done) {
      tunnel.once('end', done);
      helper.request(5000, '127.0.0.1', 'first').catch(function() {
        tunnel.close();
      });
    });

  });
}
