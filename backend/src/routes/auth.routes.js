const express = require('express');
const passport = require("passport");
const authController = require('../controllers/auth.controller');
const {
  registerValidation,
  validate,
} = require("../middlewares/auth.validator");
    

const router = express.Router();

//user_auth_routes
router.post('/user/register', registerValidation, validate, authController.registerUser);
router.post('/user/login',authController.loginUser);
router.get('/user/logout',authController.logoutUser);

//foodpartner_auth_routes
router.post('/foodpartner/register', registerValidation, validate, authController.registerFoodPartner);
router.post('/foodpartner/login',authController.loginFoodPartner);
router.get('/foodpartner/logout',authController.logoutFoodPartner); 

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