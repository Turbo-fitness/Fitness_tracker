require("dotenv").config()
// const path = require('path');
const morgan = require('morgan');
const express = require("express")
const app = express()
const cors = require('cors')
const  client  = require('./db/client');
const apiRouter = require('./api');

client.connect();
app.use(cors())
// Start of our Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//   console.log(req.body);
//   next();
// });



app.use('/api', apiRouter);

// app.get('/', (req, res, next) => {
//   res.send('Hello World from app.js!');
// });

// Catch all paths that don't exist
app.use((req, res, next) => {
  next({
    name: 'PathNotFoundError',
    message: "Sorry can't find that route/page!",
    status: 404,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  if (err.status < 500) {
    res.status(err.status).send({
      success: false,
      error: err,
      data: null,
    });
  } else {
    res.status(500).send('Whoops the server is experiencing trouble! :/');
  }
});








module.exports = app;
