const express=require('express');
const router=express.Router();
const aiController=require('../../controllers/ai.controller');
const auth = require('../../middleware/auth');


router.post('/analyze',auth,aiController.analyzeCode);

router.post('/chat',aiController.chatResponse);

router.post('/generate-problem', auth, aiController.generateProblem);



module.exports=router;