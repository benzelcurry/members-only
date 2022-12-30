const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { body, check, validationResult } = require('express-validator');

require('dotenv').config();

const Member = require('./models/member');
const Message = require('./models/message');

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'cats',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

const create_user = [
  // check('password').exists(),
  // check(
  //   'confirm_password',
  //   'Password confirmation field must have the same value as the password field'
  // )
  //   .exists()
  //   .custom((value, { req }) => value === req.body.password),

  // Process request after validation
  (req, res, next) => {
    if (req.body.password !== req.body.confirm_password) {
      const message = "Passwords don't match";
      res.render('./views/sign-up', {
        resub: true,
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        username: req.body.username,
        error: message,
      })
    }

    const member = new Member({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      username: req.body.username,
      password: req.body.password,
      membership_status: false,
    });

    member.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    })
  },
];

// Loads index
app.get('/', (req, res) => res.render('./views/index'));

// Sign-up handling
app.get('/sign-up', (req, res) => res.render('./views/sign-up'));
app.post('/sign-up', create_user);

app.listen(3000, () => console.log('App listening on Port 3000!'));