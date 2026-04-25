const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content_type: { type: String },
  content_md: { type: String },
  video_urls: [{ type: String }],
  order_index: { type: Number, default: 0 },
  xp_reward: { type: Number, default: 0 },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);