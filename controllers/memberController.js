const Member = require('../models/member');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Handles creating a new user on POST
exports.create_user = [
  body('first_name', 'First name field must not be empty')
    .trim()
    .isLength({ min: 1 }),
  body('family_name', 'Family name field must not be empty')
    .trim()
    .isLength({ min: 1 }),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username field must not be empty')
    .isAlphanumeric()
    .withMessage('Only alphanumeric characters are permitted for usernames'),
  body('password', 'Password field must not be empty')
    .trim()
    .isLength({ min: 1 }),
  body('confirm_password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password confirmation field must not be empty')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords must match'),

  // Process request after validation
  (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) { return next(err) }

      const errors = validationResult(req);

      const member = new Member({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        username: req.body.username,
        password: hashedPassword,
        membership_status: false,
        admin_status: false,
      });

      if (!errors.isEmpty()) {
        res.render('./views/sign-up', {
          resub: true,
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          username: req.body.username,
          errors: errors.array(),
        });
        return;
      }

      member.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/welcome');
      });
    });
  },
];

// Handles updating a user on POST when membership is being acquired
exports.update_user = (req, res, next) => {
  if (req.body.passcode !== 'PSEUDO') {
    res.render('./views/join', {
      error: 'INCORRECT PASSCODE',
    });
    return;
  }

  Member.findByIdAndUpdate(req.body.id, { membership_status: true }, (err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/success');
  });
}

// Handles addition of admin status on POST
exports.become_admin = (req, res, next) => {
  if (req.body.passcode !== 'ADMIN') {
    res.render('./views/become-admin', {
      error: 'INCORRECT PASSCODE',
    });
    return;
  }

  Member.findByIdAndUpdate(req.body.id, { admin_status: true }, (err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/admin-success');
  });
}