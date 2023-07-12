import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import { User } from '../models/User.model.js';

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
};

export function JwtPassport(passport) {
	passport.use(
		new JWTStrategy(options, async function (payload, done) {
			const user = await User.findById(payload.id);
			try {
				if (!user) {
					return done(null, false, { message: 'Unauthorized.' });
				}

				return done(null, user);
			} catch (err) {
				return done(err, false);
			}
		})
	);
}
