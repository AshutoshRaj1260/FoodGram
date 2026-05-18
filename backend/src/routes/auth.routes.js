const express = require('express');
const passport = require("passport");
const authController = require('../controllers/auth.controller');
const {
  userRegisterValidation,
  foodPartnerRegisterValidation,
  loginValidation,
  validate,
} = require("../middlewares/auth.validator");
const { loginLimiter } = require('../middlewares/rateLimiter.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter.middleware');
const catchAsync = require("../utils/catchAsync");  

const router = express.Router();

//user_auth_routes
router.post('/user/register', userRegisterValidation, validate, catchAsync(authController.registerUser));
router.post('/user/login', loginLimiter, loginValidation, validate, catchAsync(authController.loginUser));
router.get('/user/logout', authController.logoutUser);
router.get('/refresh-token', catchAsync(authController.refreshToken));

//foodpartner_auth_routes
router.post('/foodpartner/register', foodPartnerRegisterValidation, validate, catchAsync(authController.registerFoodPartner));
router.post('/foodpartner/login', loginLimiter, loginValidation, validate, catchAsync(authController.loginFoodPartner));
router.get('/foodpartner/logout', authController.logoutFoodPartner); 

//google_oauth_routes
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    authController.googleAuthCallback
  );
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({ message: "Google OAuth is not configured on this server." });
  });
  router.get("/google/callback", (req, res) => {
    res.status(503).json({ message: "Google OAuth is not configured on this server." });
  });
}
module.exports = router;
