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

//need new endpoint or update existing endpoint
//to write code for incrementing/toggling suitcase items?

app.patch('/trips', (req, res) => {
    console.log('updating suitcase items');

})

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
            .then(updatedTrip => res.status(204).end())
            .catch(err => res.status(500).json({ message: 'internal server error' }));
    
    }

   else {
        return SavedTrip.findById(req.params.id)
        .then(trip => {
            trip.suitcase.clothes.socks //etc.  see mongoose documentation
            if (req.body/*something*/) {}
        })


    // find way to identify specific field being updated
    // if statement to check if 'suitcase' is true
    // then have suitcaseField, (e.g. 'socks') 
    // increment/decrement, or toggle
    // savedTrip.findbyID()
    // trip.suitcase.suitcaseField +=1/-=1
    // trip.save()
    }
});

/*app.delete('/trips/:id', (req, res) => {

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
});*/


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
            suitcase: req.body.suitcase
            //SavedTrip.suitcase.clothes.shirts.create('shirts', 4);??
            //SavedTrip.suitcase.clothes.underwear('underwear', ${requiredFields[1]})
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

/*app.put('/users/:id, (req, res) => {
    put trip id in body of req 
})*/

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

app.delete('/trips/:id', (req, res) => {
    SavedTrip
        .findByIdAndRemove(req.params.id)
        .then(() => {
            User.findById(req.body.userid)
        })
        .then((User) => {
            let updatedTrips = user.trips.filter(trip => {
                trip._id != req.params.id;
            });
            user.trips = updatedTrips;
            user.save();
            return res.status(204);
        })      
        .catch(err => res.status(500).json({ message: 'internal server error' }));
})


//change this to put request to delete a trip.
app.put('/users/:id', (req, res) => {
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