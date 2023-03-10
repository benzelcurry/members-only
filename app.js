const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const compression = require('compression');
const helmet = require('helmet');
const async = require('async');
const { body, check, validationResult } = require('express-validator');

require('dotenv').config();

const Member = require('./models/member');
const member_controller = require('./controllers/memberController');
const message_controller = require('./controllers/messageController');

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set('views', __dirname);
app.set('view engine', 'ejs');

passport.use(
  new LocalStrategy((username, password, done) => {
    Member.findOne({ username: username }, (err, member) => {
      if (err) {
        return done(err);
      }
      if (!member) {
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, member.password, (err, res) => {
        if (res) {
          return done(null, member)
        } else {
          return done(null, false, { message: 'Incorrect password' })
        }
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Member.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'cats',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get('/', message_controller.display_messages);

// Sign-up handling
app.get('/sign-up', (req, res) => res.render('./views/sign-up'));
app.post('/sign-up', member_controller.create_user);

// New user welcome handling
app.get('/welcome', (req, res) => res.render('./views/welcome'));

// Log in handling
app.get('/log-in', (req, res) => res.render('./views/log-in'));
app.post('/log-in', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
}));

// Log out handling
app.get('/log-out', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Membership acquisition handling
app.get('/join', (req, res) => res.render('./views/join'));
app.post('/join', member_controller.update_user);

// Admin acquisition handling
app.get('/become-admin', (req, res) => res.render('./views/become-admin'));
app.post('/become-admin', member_controller.become_admin);

// Displays success screen upon successful membership/adminship acquisition
app.get('/success', (req, res) => res.render('./views/success'));
app.get('/admin-success', (req, res) => res.render('./views/admin-success'));

// Handles message creation
app.get('/create-message', (req, res) => res.render('./views/create-message'));
app.post('/create-message', message_controller.create_message);

// Handles message deletion
app.post('/delete-message', message_controller.delete_message);

app.listen(process.env.PORT, () => console.log('Listening...'));