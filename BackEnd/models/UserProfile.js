
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({

  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,   
  },

  location:    { type: String, default: '' },
  education:   { type: String, default: '' },
  grad_year:   { type: Number, default: '' },
  mobile:      { type: String, default: '' },
  bio:         { type: String, default: '' },

  github:      { type: String, default: '' },
  linkedin:    { type: String, default: '' },
  twitter:     { type: String, default: '' },
  resume_url:  { type: String, default: '' },

  leetcode:    { type: String, default: '' },
  codeforces:  { type: String, default: '' },
  gfg:         { type: String, default: '' },
  hackerrank:  { type: String, default: '' },

}, { timestamps: true });  

module.exports = mongoose.model('UserProfile', userProfileSchema);