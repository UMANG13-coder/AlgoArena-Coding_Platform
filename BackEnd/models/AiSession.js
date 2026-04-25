const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  time_complexity:{type:Object},
  space_complexity:{type:Object},
  code_suggestions:{type:Object},
  overall_rating:{type:Object}
}, { timestamps: true });


module.exports = mongoose.model('AiSession', aiSessionSchema);