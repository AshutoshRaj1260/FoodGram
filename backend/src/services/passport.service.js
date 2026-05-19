const passport = require("passport");
const userModel = require("../models/user.model");

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
              password: null,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;