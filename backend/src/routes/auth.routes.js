const express = require('express');
const passport = require("passport");
const authController = require('../controllers/auth.controller');

const router = express.Router();

//user_auth_routes
router.post('/user/register', authController.registerUser);
router.post('/user/verify-email', authController.verifyUserEmail);
router.post('/user/resend-otp', authController.resendUserOTP);
router.post('/user/login', authController.loginUser);
router.get('/user/logout', authController.logoutUser);

//foodpartner_auth_routes
router.post('/foodpartner/register', authController.registerFoodPartner);
router.post('/foodpartner/verify-email', authController.verifyPartnerEmail);
router.post('/foodpartner/resend-otp', authController.resendPartnerOTP);
router.post('/foodpartner/login', authController.loginFoodPartner);
router.get('/foodpartner/logout', authController.logoutFoodPartner);

//google_oauth_routes
router.get("/google",passport.authenticate("google", {scope: ["profile", "email"],}));
router.get("/google/callback",passport.authenticate("google", {session: false,failureRedirect: "/",}),authController.googleAuthCallback);

module.exports = router;