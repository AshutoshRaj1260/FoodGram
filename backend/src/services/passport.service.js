const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await userModel.findOne({ email });
        if (!user) {
          user = await userModel.create({
            fullName: profile.displayName,
            email,
            password: null, //OAuth users dont require password
          });
        }
        return done(null, user); //null - no error

      } catch (error) {
        return done(error, null); 
      }
    }
  )
);

module.exports = passport;