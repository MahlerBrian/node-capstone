'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { SavedTrip } = require('../models');
const { User } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { PORT, TEST_DATABASE_URL } = require('../config');
chai.use(chaiHttp);

function seedTripData() {
  console.info('seeding trip data');
  const seedData = [];

  for (let i = 1; i <= 5; i++) {
    seedData.push({
      destination: faker.address.city(),
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
    });
  }
  return SavedTrip.insertMany(seedData);
}

function seedUserData() {
  console.info('seeding user data');
  const seedData = [];

  for (let i = 1; i <= 5; i++) {
    seedData.push({
      firstName: faker.name.findName(),
      userName: faker.name.findName(),
      password: faker.lorem.word(),
    });
  }
  return User.insertMany(seedData);
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}


describe('Trips API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, PORT);
  });

  beforeEach(function () {
    return seedTripData();
    return seedUserData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  it('should list users on GET', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

  describe('GET endpoint', function () {
    it('should return all existing trips', function () {
      let res;
      return chai.request(app)
        .get('/trips')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return SavedTrip.count();
        })
        .then(function (count) {
          expect(res.body).to.have.lengthOf(count);
        })
    });

    it('should return trips with right fields', function () {
      let resTrip;
      return chai.request(app)
        .get('/trips')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.be.lengthOf.at.least(1);

          res.body.forEach(function (trip) {
            expect(trip).to.be.a('object');
            expect(trip).to.include.keys('id', 'destination', 'duration', 'created', 'suitcase');
          });

          resTrip = res.body[0];
          return SavedTrip.findById(resTrip.id);
        })
        .then(function (trip) {
          trip = trip.toObject();
          expect(resTrip.destination).to.equal(trip.destination);
          expect(resTrip.duration).to.equal(trip.duration);
          expect(resTrip.suitcase).to.deep.equal(trip.suitcase);
        });
    });

    describe('POST endpoint', function () {
      it('should add a new trip', function () {
        return User.findOne()
        .then(function(user) {
          const newTrip = {
            destination: faker.address.city(),
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
            },
            userID: user._id 
          };
          return chai.request(app)
          .post('/trips')
          .send(newTrip)
          .then(function (res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('destination', 'duration', 'suitcase');
            expect(res.body.destination).to.equal(newTrip.destination);
            expect(res.body.duration).to.equal(newTrip.duration);
            expect(res.body.id).to.not.be.null;
            return SavedTrip.findById(res.body.id);
          })
          .then(function (trip) {
            expect(trip.destination).to.equal(newTrip.destination);
            expect(trip.duration).to.equal(newTrip.duration);
            expect(trip.suitcase.clothes.socks).to.equal(newTrip.suitcase.clothes.socks);
            expect(trip.suitcase.toiletries.toothbrush).to.equal(newTrip.suitcase.toiletries.toothbrush);
            expect(trip.suitcase.essentials.passport).to.equal(newTrip.suitcase.essentials.passport);
          });
        })
      });
    });

    describe('PUT endpoint', function () {
      it('should update fields', function () {
        return User.findOne()
        .then(function (user) {
          const updateData = {
            destination: faker.address.city(),
            duration: faker.random.number(),
            suitcase: {
              clothes: {
                underwear: faker.random.number()
              }
            },
            userId: user._id
          };
  
          return SavedTrip
            .findOne()
            .then(function (trip) {
              updateData.id = trip.id;
              return chai.request(app)
                .put(`/trips/${trip.id}`)
                .send(updateData);
            })
            .then(function (res) {
              expect(res).to.have.status(200);
              return SavedTrip.findById(updateData.id);
            })
            .then(function (trip) {
              trip = trip.toObject();
              expect(trip.destination).to.equal(updateData.destination);
              expect(trip.duration).to.equal(updateData.duration);
              expect(trip.suitcase).to.deep.equal(updateData.suitcase);
            });
        });
      })
        
        
    });

    describe('DELETE endpoint', function () {
      it('should delete a trip by id', function () {
        let trip;
        return User.findOne()
        .then(function(user) {
          let updateData = {
            userId: user._id
          }
          return SavedTrip
          .findOne()
          .then(function (_trip) {
            trip = _trip;
            return chai.request(app).delete(`/trips/${trip.id}`)
            .send(updateData)
          })
          .then(function (res) {
            expect(res).to.have.status(204);
            return SavedTrip.findById(trip.id);
          })
          .then(function (_trip) {
            expect(_trip).to.be.null;
          });
        })
        
      });
    });
  });










/*
  describe('Users API resource', function () {

    before(function () {
      return runServer(TEST_DATABASE_URL, PORT);
    });

    beforeEach(function () {
      return seedUserData();
      return seedTripData();
    });

    afterEach(function () {
      return tearDownDb();
    });

    after(function () {
      return closeServer();
    });

    it('should list users on GET', function () {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

    describe('GET endpoint', function () {
      it('should return all existing users', function () {
        let res;
        return chai.request(app)
          .get('/users')
          .then(function (_res) {
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.have.lengthOf.at.least(1);
            return Users.count();
          })
          .then(function (count) {
            expect(res.body).to.have.lengthOf(count);
          })
      });

      it('should return users with right fields', function () {
        let resUser;
        return chai.request(app)
          .get('/users')
          .then(function (res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.be.lengthOf.at.least(1);

            res.body.forEach(function (user) {
              expect(user).to.be.a('object');
              expect(user).to.include.keys('firstName', 'userName', 'password');
            });

            resUser = res.body[0];
            return User.findById(resUser.id);
          })
          .then(function (user) {
            user = user.toObject();
            expect(resUser.firstName).to.equal(user.firstName);
            expect(resUser.userName).to.equal(user.userName);
            expect(resUser.password).to.equal(user.password);
            expect(resUser.trips).to.equal(user.trips)
          });
      });
    });

    describe('POST endpoint', function () {
      it('should create new user', function () {
        const newUser = {
          firstname: faker.name.findName(),
          userName: faker.name.findName(),
          password: faker.lorem.word(),
          trips: [SavedTrip]
        };

        return chai.request(app)
          .post('/users')
          .send(newUser)
          .then(function (res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('firstName', 'userName', 'password', 'trips');
            expect(res.body.firstName).to.equal(newUser.firstName);
            expect(res.body.userName).to.equal(newUser.userName);
            return User.findById(res.body.id);
          })
          .then(function (user) {
            expect(user.firstName).to.equal(newUser.firstname);
            expect(user.userName).to.equal(newUser.userName);
          });
      });
    });

    describe('PUT endpoint', function () {
      it('should update user fields', function () {
        const updateData = {
          firstName: 'Vlad',
          userName: 'Impala'
        }

        return User
          .findOne()
          .then(function (user) {
            updateData.id = user.id;
            return chai.request(app)
              .put(`/users/${user.id}`)
              .send(updateData);
          })
          .then(function (res) {
            expect(res).to.have.status(204);
            return Users.findById(updateData.id);
          })
          .then(function (user) {
            expect(user.firstName).to.equal(updateData.firstName);
            expect(user.userName).to.equal(updateData.userName);
          });
      });
    });
  });*/
})

