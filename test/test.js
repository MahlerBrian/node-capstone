'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {PORT, TEST_DATABASE_URL} = require('../config');
chai.use(chaiHttp);

describe('startup', function() {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function() {
      return runServer(TEST_DATABASE_URL, PORT);
    });
  
    // Close server after these tests run in case
    // we have other test modules that need to 
    // call `runServer`. If server is already running,
    // `runServer` will error out.
    after(function() {
      return closeServer();
    });
    // `chai.request.get` is an asynchronous operation. When
    // using Mocha with async operations, we need to either
    // return an ES6 promise or else pass a `done` callback to the
    // test that we call at the end. We prefer the first approach, so
    // we just return the chained `chai.request.get` object.
    it('should list users on GET', function() {
      return chai.request(app)
        .get('/')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
  });