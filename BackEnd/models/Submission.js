const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  language_id: { type: Number, required: true },
  code: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed','RunTimeError', 'CompilationError'] }, 
  runtime_ms: { type: Number },
  memory_kb: { type: Number },
  test_results: [{ type: Object }],
  test_results_hidden: [{ type: Object }],
  error_output: { type: String, default: null },
  is_submitted:{type:Boolean, default:false},
  submitted_at: { type: Date, default: Date.now },
  passed_tests:{type:Number, default:0},
  total_tests:{type:Number, default:0}
});

function arrayHasId(arr, id) {
  if (!id) return false;
  const idStr = id.toString();
  return arr.filter(Boolean).some(item => item.toString() === idStr);
}

submissionSchema.post('save', async function(doc) {

  if (doc.status !== 'Completed' || !doc.problem_id) {
    return;
  }

  try {
    const Progress = mongoose.models.Progress || require('./Progress');
    const Problem  = mongoose.models.Problem  || require('./Problem');
    const Lesson   = mongoose.models.Lesson   || require('./Lesson');

    let progress = await Progress.findOne({ user_id: doc.user_id });
    if (!progress) {
      progress = new Progress({ user_id: doc.user_id });
      console.log(`📄 Created new Progress document for user ${doc.user_id}`);
    }

    if (arrayHasId(progress.solved_problems, doc.problem_id)) {
      progress.last_activity = Date.now();
      await progress.save();
      console.log(`ℹ️ Problem ${doc.problem_id} already solved, skipping`);
      return;
    }

    progress.solved_problems.addToSet(doc.problem_id);
    progress.last_activity = Date.now();

    const problem = await Problem.findById(doc.problem_id);
    if (!problem || !problem.lesson_id) {
      await progress.save();
      console.log(`✅ Progress updated (problem only) for user ${doc.user_id}`);
      return;
    }

    const lesson_id = problem.lesson_id;

    const totalProblemsInLesson = await Problem.countDocuments({ lesson_id });
    const solvedInLesson = await Problem.countDocuments({
      _id: { $in: progress.solved_problems.filter(Boolean) },
      lesson_id
    });

    if (solvedInLesson >= totalProblemsInLesson) {

      if (!arrayHasId(progress.completed_lessons, lesson_id)) {
        progress.completed_lessons.addToSet(lesson_id);
        console.log(`📚 Lesson ${lesson_id} completed!`);

        const lesson = await Lesson.findById(lesson_id);
        if (lesson && lesson.module_id) {
          const module_id = lesson.module_id;
          const totalLessonsInModule = await Lesson.countDocuments({ module_id });
          const completedInModule = await Lesson.countDocuments({
            _id: { $in: progress.completed_lessons.filter(Boolean) },
            module_id
          });

          if (completedInModule >= totalLessonsInModule) {
            if (!arrayHasId(progress.completed_modules, module_id)) {
              progress.completed_modules.addToSet(module_id);
              console.log(`🏆 Module ${module_id} completed!`);
            }
          }
        }
      }
    }

    await progress.save();
    console.log(`✅ Progress updated for user ${doc.user_id} — solved: ${progress.solved_problems.length}`);

  } catch (err) {
    console.error("❌ Error in Submission post-save hook updating progress:", err);
  }
});

module.exports = mongoose.model('Submission', submissionSchema);