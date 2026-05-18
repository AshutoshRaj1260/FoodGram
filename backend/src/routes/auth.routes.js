const express = require('express');
const passport = require("passport");
const authController = require('../controllers/auth.controller');
const {
  registerValidation,
  validate,
} = require("../middlewares/auth.validator");
const catchAsync = require("../utils/catchAsync");  

const router = express.Router();

//user_auth_routes
router.post('/user/register', registerValidation, validate, catchAsync(authController.registerUser));
router.post('/user/login', catchAsync(authController.loginUser));
router.get('/user/logout', authController.logoutUser);

//foodpartner_auth_routes
router.post('/foodpartner/register', registerValidation, validate, catchAsync(authController.registerFoodPartner));
router.post('/foodpartner/login', catchAsync(authController.loginFoodPartner));
router.get('/foodpartner/logout', authController.logoutFoodPartner); 

//google_oauth_routes
router.get("/google",passport.authenticate("google", {scope: ["profile", "email"],}));
router.get("/google/callback",passport.authenticate("google", {session: false,failureRedirect: "/",}),authController.googleAuthCallback);

module.exports = router;