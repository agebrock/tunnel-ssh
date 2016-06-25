var tunnel = require('../');
var net = require('net');
var debug = require('debug')('tunnel-ssh:test');
var helper = require('./server');
var chai = require('chai'),
  expect = chai.expect;


describe('tunnel-ssh', function() {

  it('should emit an error', function(done) {

    var config = {
      host: '127.0.0.1',
      username: process.env.USER,
      dstPort: 8000,
      localPort: 7000
    };

    tunnel(config, function() {
      helper.createClient(7000, '127.0.0.1', done);
    }).on('error', function(e) {
      expect(e).to.be.instanceOf(Error);
      done(null);
    });
  });

  it('brokenConfig, should callback an error', function(done) {
    var brokenConfig = {};

    tunnel(brokenConfig, function(e) {
      expect(e).to.be.instanceOf(Error);
      done();
    });
  });

  it('brokenConfig, should emit an error', function(done) {
    var brokenConfig = {};

    tunnel(brokenConfig).on('error', function(e) {
      expect(e).to.be.instanceOf(Error);
      done(null);
    });
  });
});

/*
 // Keep alive
 var configA = {
 host: '127.0.0.1',
 username: process.env.USER,
 dstPort: 8000,
 localPort: 7000,
 // Use keepAlive:true to keep the tunnel open.
 keepAlive: true
 };
 var tunnelKeepAlive = tunnel(configA, function() {
 console.log('Tunnel open');
 helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
 helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
 helper.createClient(7000, '127.0.0.1', console.log).on('close', function() {
 setTimeout(function() {
 // Call tunnel.close() to shutdown the server.
 console.log('TRYING TO CLOSE');
 tunnelKeepAlive.close();
 }, 2000);
 });
 });
 });
 }).on('error', function(e) {
 console.log('error', e);
 });
 });

 */
