const express=require('express');
const router=express.Router();
const submissionController=require('../../controllers/submission.controller');
const auth=require('../../middleware/auth');

router.get('/',    auth, submissionController.getSubmissions);
router.post('/run',   auth, submissionController.runCode);
router.post('/submit',   auth, submissionController.addSubmission);
router.get('/:id', auth, submissionController.getSubmissionResult);
router.delete('/:id', auth, submissionController.deleteSubmission);

module.exports=router;