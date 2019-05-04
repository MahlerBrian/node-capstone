'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const { SavedTrip, User } = require('./models');
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

app.put('/trips/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableFields = ['destination', 'duration', 'suitcase'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    SavedTrip
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedTrip => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'internal server error' }));
});

app.delete('/trips/:id', (req, res) => {

    const updated = {};
    const updateableFields = ['suitcase'];
    let items = Object.keys(suitcase);
    SavedTrip
        .findOneAndDelete(req.params.id)   //what can I put here besides id?
        .then(() => {                      //trying to remove one field from
                                           //object but leave object alone 
            console.log(`Deleted trip with id \`${req.params.id}\``);
            res.status(204).end();
        });
});


app.post('/trips', (req, res) => {
    //entirely new trip
})
//two put requests for app.put/trips and app.put/----

//delete endpoint for deleting items from list, 
//but also deleting entire trips


app.get('/users', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(
                    (user) => user.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json( {message: 'internal server error'} );
        })
});

app.post('/users', (req, res) => {
    const requiredFields = ['username', 'password'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

        User
            .findOne({ userName: req.body.userName })
            .then(user => {
                if (user) {
                    const message = `Username already exists`;
                    console.error(message);
                    return res.status(400).send(message);
                }
                else {
                    User
                    .create({
                        firstName: req.body.firstName,
                        userName: req.body.userName
                        //password?
                    })
                    .then(user => res.status(201).json(user.serialize()))
                    .catch(err => {
                        console.err(err);
                        res.status(500).json({ error: 'internal server error' });
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'internal server error' });
            });   
});

app.put('/users/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: `Request path id and request id values do not match`
        });
    }

    const updated = {};
    const updateableFields = ['firstName', 'userName'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    User
        .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id }})
        .then(user => {
            if(user) {
                const message = `Username already exists`;
                console.error(message);
                return res.status(400).send(message);
            }
            else {
                User
                    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
                    .then(updatedUser => {
                        res.status(200).json({
                            id: updatedUser.id,
                            name: `${updatedUser.firstName}`,
                            userName: updatedUser.userName
                        });
                    })
                    .catch(err => res.status(500).json({ message: err }));
            }
        });
});

app.delete('/users/:id', (req, res) => {
    SavedTrip
        .remove({ user: req.params.id }) //not sure this is right?
        .then(() => {
            User
                .findByIdAndRemove(req.params.id)
                .then(() => {
                    console.log(`Deleted trip owned by User \`${req.params.id}\``);
                    res.status(204).json({ message: 'success' });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'internal server error' });
        });
});


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

