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

describe('work in progress...', function() {

  beforeEach(function(done) {
    config = {
      dstPort: 8000,
      srcPort: 5000
    };
    server = helper.createServer(config.dstPort, '127.0.0.1', function() {
      createTunnel(config).then(function(t) {
        tunnel = t;
        done();
      });
    });
  });

  afterEach(function() {
    server.close();
    tunnel.close();
  });

  it('map local port 5000 => 8000', function() {
    return expect(helper.request(5000, '127.0.0.1', 'redirect')).to.eventually.eql('127.0.0.1:8000:redirect');
  });


});
