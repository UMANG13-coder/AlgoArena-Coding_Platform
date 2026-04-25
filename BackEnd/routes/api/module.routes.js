const express=require('express');
const router=express.Router()
const moduleControllers=require('../../controllers/module.controller')
const auth=require('../../middleware/auth')



router.get('/',auth,moduleControllers.getAllModules)

router.get('/:id',auth,moduleControllers.getModuleById)

router.post('/',auth,moduleControllers.createModule)

router.patch('/:id',auth,moduleControllers.editModule)

router.delete('/:id',auth,moduleControllers.deleteModule)

module.exports=router