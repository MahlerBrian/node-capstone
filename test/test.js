'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const {SavedTrip} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {PORT, TEST_DATABASE_URL} = require('../config');
chai.use(chaiHttp);

function seedTripData() {
  console.info('seeding trip data');
  const seedData = [];

  for (let i=1; i<=5; i++) {
    seedData.push({saved_trips: [{
      destination: faker.name.city(),
      duration: faker.random.number(),
      suitcase: {
        clothes: {
          shirts: faker.random.number(),
          pants: faker.random.number(),
          underwear: faker.random.number(),
          socks: faker.random.number(),
          jacket: faker.random.number(),
          shoes: faker.random.number()
        },
        toiletries: {
          toothbrush: faker.random.boolean(),
          toothpaste: faker.random.boolean(),
          deodorant: faker.random.boolean(),
          shampoo: faker.random.boolean(),
          floss: faker.random.boolean()
        },
        essentials: {
          passport: faker.random.boolean(),
          camera: faker.random.boolean(),
          phone: faker.random.boolean()
        }   
      }
    }]
  });
  return SavedTrip.insertMany(seedData);
}}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}


describe('Trips API resource', function() {

    before(function() {
      return runServer(TEST_DATABASE_URL, PORT);
    });

    beforeEach(function() {
      return seedTripData();
    });

    afterEach(function() {
      return tearDownDb();
    });

    after(function() {
      return closeServer();
    });

    it('should list users on GET', function() {
      return chai.request(app)
        .get('/')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

    describe('GET endpoint', function() {
      it('should return all existing trips', function() {
        let res;
        return chai.request(app)
          .get('/trips')
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.have.lengthOf.at.least(1);
            return SavedTrip.count();
          })
          .then(function(count) {
            expect(res.body).to.have.lengthOf(count);
          })
      });

      it('should return trips with right fields', function() {
        let resTrip;
        return chai.request(app)
          .get('/trips')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.be.lengthOf.at.least(1);

            res.body.forEach(function(trip) {
              expect(trip).to.be.a('object');
              expect(trip).to.include.keys('id', 'destination', 'duration', 'suitcase');
            });

            resTrip = res.body[0];
            return SavedTrip.findById(resTrip.id);
          })
          .then(function(trip) {
            expect(resTrip.destination).to.equal(trip.destination);
            expect(resTrip.duration).to.equal(trip.destination);
            expect(resTrip.suitcase).to.equal(trip.suitcase);
          });
      });
    })
  })