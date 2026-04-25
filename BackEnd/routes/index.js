const express=require('express');
const router=express.Router()
const userRoutes=require('./api/user.routes');
const moduleRoutes=require('./api/module.routes')
const submissionRoutes=require('./api/submission.routes');
const problemRoutes=require('./api/problem.routes');
const lessonRoutes=require('./api/lesson.routes')
const aiRoutes=require('./api/ai.routes')

router.use('/user',userRoutes)
router.use('/module',moduleRoutes)
router.use('/submission',submissionRoutes)
router.use('/problem',problemRoutes)
router.use('/lesson',lessonRoutes)
router.use('/ai',aiRoutes)


router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

module.exports=router