const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description_md: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags: [{ type: String }],
  supported_languages: [{ type: String }],

  constraints: { 
    time_limit_ms: { type: Number, default: 2000 },      
    memory_limit_kb: { type: Number, default: 128000 },  
    details: [{ type: String }]                          
  },

  test_cases: [{ 
    input: { type: String, required: true },
    expected_output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }], 

  hints: [{ type: String }], 
  solution_meta: { type: Object },
  isSolved: { type: Boolean, default: false },  
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);