const Message = require('../models/message');

const { body, validationResult } = require('express-validator');

// Handles creation of a new message on POST
exports.create_message = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a title')
    .isLength({ max: 100 })
    .withMessage('Title must be 100 characters or less'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a message')
    .isLength({ max: 1000 })
    .withMessage('Message must be 1000 characters or less'),

  // Process request after validation
  (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      date: new Date(),
      author: req.body.author
    });

    if (!errors.isEmpty()) {
      res.render('./views/create-message', {
        resub: true,
        title: req.body.title,
        content: req.body.content,
        errors: errors.array(),
      });
      return;
    }

    message.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  },
];

// Displays messages on GET
exports.display_messages = (req, res, next) => {
  Message.find()
    .sort({ date: -1 })
    .exec((err, message_list) => {
      if (err) {
        return next(err);
      }

      if (!message_list) {
        res.render('./views/index');
      }

      res.render('./views/index', {
        messageList: message_list,
      });
    });
}

// Delete messages on POST
exports.delete_message = (req, res, next) => {
  Message.findByIdAndRemove(req.body.messageID, (err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
};