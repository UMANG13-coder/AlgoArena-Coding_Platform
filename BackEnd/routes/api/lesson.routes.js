const express=require('express');
const router=express.Router();
const lessonController=require('../../controllers/lesson.controller');
const auth = require('../../middleware/auth');


router.get('/',auth,lessonController.getAllLessons);

router.get('/:id',auth,lessonController.getLessonById);

router.post('/',auth,lessonController.createLesson);

router.patch('/:id',auth,lessonController.updateLesson);

router.delete('/:id',auth,lessonController.deleteLesson);

module.exports=router;