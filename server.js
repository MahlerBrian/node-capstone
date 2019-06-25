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



//Serve static file:
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
});

//Gets all extant trips:
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

//Gets specific trip:
app.get('/trips/:id', (req, res) => {
    SavedTrip
        .findById(req.params.id)
        .then(trip => res.json(trip.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'internal server error' });
        });
});

//create new trip
app.post('/trips', (req, res) => {
    const requiredFields = ['destination', 'duration'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    SavedTrip
        .create({
            destination: req.body.destination,
            duration: req.body.duration,
            suitcase: {
                clothes: {
                    shirts: req.body.duration,
                    pants: req.body.duration /2,
                    underwear: req.body.duration,
                    socks: req.body.duration,
                    jacket: 1,
                    shoes: 1
                },
                toiletries: {
                    toothbrush: false,
                    toothpaste: false,
                    deodorant: false,
                    shampoo: false,
                    floss: false
                },
                essentials: {
                    passport: false,
                    camera: false,
                    phone: false
                }
            }
        })
        .then(trip => {
            return User.findById(req.body.userId)
            .then(user => {
                user.trips.push(trip);
                user.save();
                res.status(201).json(user.serialize())
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'internal server error' });
        });
});

//Updates extant trip:
app.put('/trips/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableFields = ['destination', 'duration',];

    if (req.body.suitcase == false) {
        updateableFields.forEach(field => {
            if (field in req.body) {
                updated[field] = req.body[field];
            }
        });
    
        SavedTrip
            .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
            .then(updated => res.status(204).end())   
            .catch(err => res.status(500).json(err));
    }

   else {
        return SavedTrip.findById(req.params.id)
        .then(trip => {
            let category = req.body.category;
            let item = req.body.item;

            if (req.body.action === 'increment') {
                trip.suitcase[category][item] +=1;
            }
            else if (req.body.action === 'decrement') {
                trip.suitcase[category][item] -=1;
            }
            
            else if (req.body.action === 'toggle') {
                if (trip.suitcase[category][item] === true) {
                    trip.suitcase[category][item] = false
                }
                else {
                    trip.suitcase[category][item] = true
                }
            }
            return trip.save()
            .then(trip => {
                return User.findOneAndUpdate({"_id": req.body.userId, "trips._id": req.params.id}, {"$set": {"trips.$": trip}})
                .then(user => {
                    res.status(200).json(user);
                })
            })  
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        } 
    )}
});

app.delete('/trips/:id', (req, res) => {
    SavedTrip
        .findByIdAndRemove(req.params.id)
        .then(() => {
            return User.findById(req.body.userId)
        })
        .then(user => {
            let updatedTrips = user.trips.filter(trip => {
            return trip._id != req.params.id;
            });
            user.trips = updatedTrips;
            user.save();
            res.status(200).json(user);
        })      
        .catch(err => {
            console.log(err) 
            res.status(500).json({ message: 'internal server error' });
        })
})



//get extant user
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

app.get('/users/:id', (req, res) => {
    User
        .findById(req.params.id)
        .then(user => {
            res.status(200).json(user.serialize())
        })
})

//post request for new user to login, password validation. 
app.post('/users', (req, res) => {
    const requiredFields = ['firstName', 'userName', 'password'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

        return User.findOne({ userName: req.body.userName })
            .then(user => {
                if (user) {
                    const message = `Username already exists`;
                    console.error(message);
                    return res.status(400).send(message);
                }
                else {
                    return User.hashPassword(req.body.password)
                    .then(hash => {
                        return User.create({
                            firstName: req.body.firstName,
                            userName: req.body.userName,
                            password: hash})
                    })
                    .then(user => res.status(201).json(user.serialize()))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'internal server error' });
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'internal server error' });
            });   
});

//update user info
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

app.post('/login', (req, res) => {
    return User.findOne({ userName: req.body.userName })
            .then(user => {
                if (user) {
                    return user.validatePassword(req.body.password)
                    .then(passwordCorrect => {
                        if (passwordCorrect) {
                            res.status(200).json(user.serialize())
                        }
                        else {
                            res.status(400).send('incorrect password')
                        }
                    })
                    .then(user => res.status(201).json(user.serialize()))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'internal server error' });
                    });
                }
                else {
                    const message = `User not found`;
                    return res.status(400).send(message)
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'internal server error' });
            });   
})



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