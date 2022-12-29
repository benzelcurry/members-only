const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, maxLength: 30 },
  password: { type: String, required: true, maxLength: 50 },
  membership_status: { type: Boolean, required: false },
});

module.exports = mongoose.model('Member', MemberSchema);