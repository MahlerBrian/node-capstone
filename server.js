'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const { SavedTrip } = require('./models');
let server;

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());




app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
});

app.get('/trips', (req, res) => {
    SavedTrip
        .find()
        .then(trips => {
            res.json(trips.map(trip => trip.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'internal server error' });
        });
});

app.get('/trips/:id', (req, res) => {
    SavedTrip
        .findById(req.params.id)
        .then(trip => res.json(trip.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'internal server error' });
        });
});

app.post('/trips', (req, res) => {
    //entirely new trip
})
//two put requests for app.put/trips and app.put/----

//delete endpoint for deleting items from list, 
//but also deleting entire trips

function runServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(databaseUrl, err => {
        if (err) {
          return reject(err);
        }
  
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
      });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

  if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  };


  
  module.exports = { runServer, app, closeServer };

