const express=require('express');
const router=express.Router()
const authControllers=require('../../controllers/auth.controller')
const userControllers=require('../../controllers/user.controller')
const auth=require('../../middleware/auth')
const multer=require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

router.get('/',auth,userControllers.getAllUsers)

router.get('/generateUrl',authControllers.generateRedirectUrl)

router.get('/googleLogin',authControllers.handleGoogleCallback)

router.get('/profile/:id',auth,userControllers.getUserProfile)

router.get('/:id',auth,userControllers.getUserById)

router.post('/login',authControllers.Login)

router.post('/signup',upload.single('avatar_url'),authControllers.Signup)

router.patch('/:id',auth,userControllers.editUser)

router.patch('/profile/:id',auth,userControllers.editUserProfile)

router.post('/profile/:id/avatar', auth, upload.single('avatar'), userControllers.uploadAvatar)

router.delete('/:id',auth,userControllers.deleteUser)

module.exports=router
