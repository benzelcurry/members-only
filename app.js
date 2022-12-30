const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const async = require('async');
const { body, check, validationResult } = require('express-validator');

require('dotenv').config();

// const Member = require('./models/member');
// const Message = require('./models/message');
const member_controller = require('./controllers/memberController');

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

// const create_user = [
//   body('first_name', 'First name field must not be empty')
//     .trim()
//     .isLength({ min: 1 }),
//   body('family_name', 'Family name field must not be empty')
//     .trim()
//     .isLength({ min: 1 }),
//   body('username')
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage('Username field must not be empty')
//     .isAlphanumeric()
//     .withMessage('Only alphanumeric characters are permitted for usernames'),
//   body('password', 'Password field must not be empty')
//     .trim()
//     .isLength({ min: 1 }),
//   body('confirm_password')
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage('Password confirmation field must not be empty')
//     .custom((value, { req }) => value === req.body.password)
//     .withMessage('Passwords must match'),

//   // Process request after validation
//   (req, res, next) => {
//     bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
//       if (err) { return next(err) }

//       const errors = validationResult(req);

//       const member = new Member({
//         first_name: req.body.first_name,
//         family_name: req.body.family_name,
//         username: req.body.username,
//         password: hashedPassword,
//         membership_status: false,
//       });

//       if (!errors.isEmpty()) {
//         res.render('./views/sign-up', {
//           resub: true,
//           first_name: req.body.first_name,
//           family_name: req.body.family_name,
//           username: req.body.username,
//           errors: errors.array(),
//         });
//         return;
//       }

//       member.save((err) => {
//         if (err) {
//           return next(err);
//         }
//         res.redirect('/');
//       });
//     });
//   },
// ];

// Loads index
app.get('/', (req, res) => res.render('./views/index'));

// Sign-up handling
app.get('/sign-up', (req, res) => res.render('./views/sign-up'));
app.post('/sign-up', member_controller.create_user);

app.listen(3000, () => console.log('App listening on Port 3000!'));