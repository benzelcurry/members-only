const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  content: { type: String, required: true, maxLength: 1000 },
  date: { type: Date },
  author: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
});

// Might add catalog routing; will need to change URL path if so
MessageSchema.virtual('url').get(function() {
  return `/messages/${this._id}`;
});

MessageSchema.virtual('date_formatted').get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Message', MessageSchema);