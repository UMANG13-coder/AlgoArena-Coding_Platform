const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  tags: [{ type: String }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order_index: { type: Number, default: 0 },
  is_published: { type: Boolean, default: false },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  created_at: { type: Date, default: Date.now }
});
const Module= mongoose.model('Module', moduleSchema);

module.exports = Module;