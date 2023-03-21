import bcrypt from "bcryptjs";
import dotenv from "dotenv";
// import appleStrategy from "passport-appleid";
import facebookStrategy from "passport-facebook";
import googleStrategy from "passport-google-oauth20";
import passportLocal from "passport-local";
import { Business } from "../models/Business.model.js";

dotenv.config();
// OAuth Strategies
const GoogleStrategy = googleStrategy.Strategy;
const FacebookStrategy = facebookStrategy.Strategy;
// const AppleStrategy = appleStrategy.Strategy;
const LocalStrategy = passportLocal.Strategy;

// Business Local

export const BusinessStrategy = new LocalStrategy(
  {
    usernameField: "businessEmail",
    passwordField: "password",
    session: true,
  },
  async function (businessEmail, password, done) {
    // find user by email and password using Model2
    Business.findOne({ businessEmail: businessEmail })
      .then(async (user) => {
        console.log(user);
        if (!user) {
          return done(null, false, { message: "User doesn't Exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      })
      .catch((err) => done(err));
  }
);

// Google Strategy
export const BusinessGoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:8080/api/business/google/callback",
  },
  function (accessToken, refreshToken, profile, cb) {
    Business.findOrCreate(
      {
        googleId: profile.id,
        username: profile.displayName,
      },
      function (err, user) {
        return cb(err, user);
      }
    );
  }
);

// // Facebook Strategy
// export const BusinessFacebookStrategy = new FacebookStrategy(
//   {
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:8080/auth/facebook/codehub",
//   },
//   function (accessToken, refreshToken, profile, cb) {
//     User.findOrCreate(
//       {
//         facebookId: profile.id,
//         username: profile.displayName,
//       },
//       function (err, user) {
//         return cb(err, user);
//       }
//     );
//   }
// );

// // Apple Strategy
// export const BusinessAppleStrategy = new AppleStrategy(
//   {
//     clientID: APPLE_SERVICE_ID,
//     callbackURL: "https://www.example.net/auth/apple/callback",
//     teamId: APPLE_TEAM_ID,
//     keyIdentifier: "RB1233456",
//     privateKeyPath: path.join(__dirname, "./AuthKey_RB1233456.p8"),
//   },
//   function (accessToken, refreshToken, profile, done) {
//     const id = profile.id;
//     User.findOrCreate({}, function (err, user) {
//       done(err, user);
//     });
//   }
// );
