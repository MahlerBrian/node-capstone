const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.static('public'));


const {PORT, DATABASE_URL} = require('./config');
let server;


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
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

