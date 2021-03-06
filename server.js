'use strict';
require('dotenv').config();
//Required depndencies
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {PORT}=require('./config');
const passport=require('passport');
const {CLIENT_ORIGIN}=require('./config');


//Routers
const moodboardsRouter = require('./routes/boards');
const imagesRouter = require('./routes/images');
const usersRouter = require('./routes/users');
const cloudRouter = require('./routes/cloud');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

//Creation of express app
const app = express();

//Log all requests
app.use(morgan('dev'));

//Create a Static Webserver
app.use(express.static('public'));

//Enable CORS support
// app.use(cors({
//   origin: CLIENT_ORIGIN
// }));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});



//Parse request body
app.use(express.json());

//passport strategies
passport.use(localStrategy);
passport.use(jwtStrategy);

//Mount our routers on desired path
app.use('/api/moodboards', moodboardsRouter);
app.use('/api/users',usersRouter);
app.use('/api/images',imagesRouter);
app.use('/api/cloudinary',cloudRouter);
app.use('/api/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
  
// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if (require.main === module) {
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}
  
module.exports = app; // Export for testing