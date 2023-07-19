import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { User } from "../models/User.model.js";
import { Business } from "../models/Business.model.js";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export function JwtPassport(passport) {
  passport.use(
    new JWTStrategy(options, async function (payload, done) {
      try {
		console.log(payload);
        const user = await User.findById(payload.id);
        if (!user) {
          return done(null, false, { message: "Unauthorized." });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  passport.use(
    "business",
    new JWTStrategy(options, async function (payload, done) {
      try {
        const business = await Business.findById(payload.id);
        if (!business) {
          return done(null, false, { message: "Unauthorized." });
        }

        business.password = undefined;

        return done(null, business);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
