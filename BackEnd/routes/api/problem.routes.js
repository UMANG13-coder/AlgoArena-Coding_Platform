const express=require('express');
const router=express.Router();
const problemController=require('../../controllers/problem.controller');
const auth=require('../../middleware/auth');


router.post('/',auth,problemController.addProblem);

router.get('/',auth,problemController.getAllProblems);

router.get('/:id',auth,problemController.getProblemById);

router.patch('/:id',auth,problemController.updateProblem);
router.delete('/:id',auth,problemController.deleteProblem);

module.exports=router;