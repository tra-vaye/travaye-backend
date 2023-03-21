import dotenv from "dotenv";
import facebookStrategy from "passport-facebook";
import googleStrategy from "passport-google-oauth20";
import passportLocal from "passport-local";
import { User } from "../models/User.model.js";
dotenv.config();
// OAuth Strategies
const GoogleStrategy = googleStrategy.Strategy;
const FacebookStrategy = facebookStrategy.Strategy;
// const AppleStrategy = appleStrategy.Strategy;
const LocalStrategy = passportLocal.Strategy;

// Google Strategy
export const UserGoogleStrategy = new GoogleStrategy(
  {
    callbackURL: "http://localhost:8080/api/user/auth/google/callback",
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  async function (accessToken, refreshToken, profile, cb) {
    const formattedName = profile._json.name.split(" ").join("_");

    try {
      const existingUser = await User.findOne({ email: profile._json.email });
      if (existingUser) {
        return cb(null, existingUser);
      } else if (!existingUser) {
        User.create({
          fullName: profile._json.name,
          username: formattedName + Math.floor(1000 + Math.random() * 900000),
          email: profile._json.email,
          googleId: profile.id,
        }).then(function (err, doc) {
          if (err) return cb(err, null);
          return cb(err, doc);
          // saved!
        });
      }
    } catch (error) {
      return cb(error, null);
    }

    // function (err, user) {
    //   return cb(err, user);
    // }
    // User.findOne({ email: profile._json.email })
    //   .then(async function (err, user) {
    //     if (!err) {
    //       if (user) {
    //         return cb(err, user);
    //       }
    //     } else {
    //       const formattedName = profile._json.name.split(" ").join("_");
    //       User.create(
    //         {
    //           fullName: profile._json.name,
    //           username:
    //             formattedName + Math.floor(1000 + Math.random() * 900000),
    //           email: profile._json.email,
    //           googleId: profile.id,
    //         },
    //         (err, user) => {
    //           return cb(err, user);
    //         }
    //       );
    //     }

    //     return cb(err, user);
    //   })
    //   .catch((err) => cb(err));
    console.log(profile);
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
