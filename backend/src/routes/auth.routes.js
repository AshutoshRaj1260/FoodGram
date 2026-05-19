const express = require('express');
const passport = require("passport");
const authController = require('../controllers/auth.controller');
const {
  userRegisterValidation,
  foodPartnerRegisterValidation,
  loginValidation,
  validate,
} = require("../middlewares/auth.validator");
    

const router = express.Router();

//user_auth_routes
router.post('/user/register', userRegisterValidation, validate, authController.registerUser);
router.post('/user/login', loginValidation, validate, authController.loginUser);
router.get('/user/logout',authController.logoutUser);

//foodpartner_auth_routes
router.post('/foodpartner/register', foodPartnerRegisterValidation, validate, authController.registerFoodPartner);
router.post('/foodpartner/login', loginValidation, validate, authController.loginFoodPartner);
router.get('/foodpartner/logout',authController.logoutFoodPartner); 

//google_oauth_routes
router.get("/google",passport.authenticate("google", {scope: ["profile", "email"],}));
router.get("/google/callback",passport.authenticate("google", {session: false,failureRedirect: "/",}),authController.googleAuthCallback);

module.exports = router;
