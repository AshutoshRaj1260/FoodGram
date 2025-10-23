const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

//user_auth_routes
router.post('/user/register',authController.registerUser);
router.post('/user/login',authController.loginUser);
router.get('/user/logout',authController.logoutUser);


//foodpartner_auth_routes
router.post('/foodpartner/register',authController.registerFoodPartner);
router.post('/foodpartner/login',authController.loginFoodPartner);
router.get('/foodpartner/logout',authController.logoutFoodPartner); 


module.exports = router;