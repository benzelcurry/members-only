const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

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

app.get('/', (req, res) => res.render('./views/index'));

app.get('/sign-up', (req, res) => res.render('./views/sign-up'));

app.listen(3000, () => console.log('App listening on Port 3000!'));