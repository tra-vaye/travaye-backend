import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
// import { createLocation } from "./controllers/location.controllers.js";
import businessRouter from './routes/business.routes.js';
import locationRouter from './routes/location.routes.js';
import userRouter from './routes/user.routes.js';
import { JwtPassport } from './config/passport.js';
import payRouter from './routes/paystack.routes.js';
import path from 'path';
import { dirname } from './lib/index.js';
import LocationBudget from './models/LocationBudget.js';

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(morgan('common'));

app.set('view engine', 'pug');
app.set('views', path.join(dirname(import.meta.url), '/views/'));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use(express.static(path.join(dirname(import.meta.url), 'public/')));

var whitelist = [
	'http://localhost:3000',
	'http://www.localhost:3000',
	'http://172.20.10.9:3000',
	'http://www.172.20.10.9:3000',
	'https://travaye-beta.netlify.app',
	'https://www.travaye-beta.netlify.app',
	'https://travaye-frontend.vercel.app',
	'https://www.travaye-frontend.vercel.app',
];
var corsOptions = {
	origin:
		process.env.NODE_ENV != 'production'
			? '*'
			: function (origin, callback) {
					if (whitelist.indexOf(origin) !== -1) {
						callback(null, true);
					} else {
						callback(new Error('Not allowed by CORS'));
					}
			  },
};
app.use(cors(corsOptions));
app.use(
	session({
		secret: 'LolSecretIsHere',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(cookieParser());
app.use(passport.initialize());
// app.use(passport.session());
// function SessionConstructor(userId, userGroup, details) {
//   this.userId = userId;
//   this.userGroup = userGroup;
//   this.details = details;
// }
// passport.use(
//   "userLocal",
//   new LocalStrategy({ usernameField: "username" }, User.authenticate())
// );
// const businessStrategy = new LocalStrategy(
//   {
//     usernameField: "businessEmail",
//     passwordField: "password",
//     session: true,
//   },
//   async function (businessEmail, password, done) {
//     // find user by email and password using Model2
//     Business.findOne({ businessEmail: businessEmail })
//       .then(async (user) => {
//         console.log(user);
//         if (!user) {
//           return done(null, false, { message: "User doesn't Exist" });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//           return done(null, false, { message: "Incorrect email or password." });
//         }

//         return done(null, user);
//       })
//       .catch((err) => done(err));
//   }
// );
// passport.use("businessLocal", businessStrategy);

// // used to serialize the user for the session
// passport.serializeUser(function (userObject, done) {
//   let userGroup = "User";
//   let userPrototype = Object.getPrototypeOf(userObject);
//   if (userPrototype === User.prototype) {
//     userGroup = "User";
//   } else if (userPrototype === Business.prototype) {
//     userGroup = "Business";
//   }
//   let sessionContructor = new SessionConstructor(userObject.id, userGroup, "");
//   done(null, sessionContructor);
// });
// // deserialize the user
// passport.deserializeUser(function (sessionContructor, done) {
//   if (sessionContructor.userGroup === "User") {
//     User.findById({ _id: sessionContructor.userId }, function (err, user) {
//       done(err, user);
//     });
//   } else if (sessionContructor.userGroup === "Business") {
//     Business.findById({ _id: sessionContructor.userId }, function (err, user) {
//       done(err, user);
//     });
//   }
// });

JwtPassport(passport);

// ROUTES WITH FILES
// app.post(
//   "/api/location",
//   // (req, res, next) => {
//   //   if (req.isAuthenticated()) {
//   //     next();
//   //   } else {
//   //     res.status(403).json({ error: "Sorry you're not allowed in this Zone." });
//   //   }
//   // },
//   upload.array("pictures"),
//   createLocation
// );

// ROUTES
app.use('/api/budgets', async (req, res) => {
	return res.json(await LocationBudget.find().sort('+min'));
});
app.use('/api/user', userRouter);
app.use('/api/business', businessRouter);
app.use('/api/location', locationRouter);
app.use('/api/pay', payRouter);
app.get(
	'/api/categories',
	passport.authenticate(['business', 'jwt'], { session: false }),
	(req, res) => {
		return res.json([
			{
				name: 'Entertainment Venues',
				sub: [
					{ name: 'Cinema', slug: 'cinema' },
					{ name: 'Arcade', slug: 'arcade' },
					{ name: 'Club', slug: 'club' },
				],
			},
			{
				name: 'Special Events',
				sub: [
					{ name: 'Festivals & Parades', slug: 'festivals-and-parades' },
					{ name: 'Party', slug: 'party' },
					{ name: 'Exhibition', slug: 'exhibition' },
				],
			},
			{
				name: 'Wildlife Attractions',
				sub: [{ name: 'Zoo', slug: 'zoo' }],
			},
			{
				name: 'History & Arts',

				sub: [
					{ name: 'Museum & Art Gallery', slug: 'museum-and-artGallery' },
					{
						name: 'Unique Building Attractions',
						slug: 'unique-building-attraction',
					},
				],
			},
			{
				name: 'Food & Drinks',
				sub: [
					{ name: 'Restaurants & Cafe', slug: 'restaurant-and-cafe' },
					{ name: 'Bar & Lounge', slug: 'bar-and-lounge' },
					{ name: 'Fast Food Spot', slug: 'fast-food-spot' },
				],
			},
			{
				name: 'Sports & Recreation Centres',
				sub: [
					{
						name: 'Stadiums',
						slug: 'stadium',
					},
					{ name: 'Sport Events', slug: 'sport-event' },
					{ name: 'Sport Centers', slug: 'sport-center' },
				],
			},
			{
				name: 'Historial & Heritage Attractions',
				sub: [
					{
						name: 'Mountains & Caves & Hills & Islands',
						slug: 'mountain-and-cave-and-hill-island',
					},
					{ name: 'Waterfalls', slug: 'waterfall' },
				],
			},
			{
				name: 'Parks & Relaxation Spots',
				sub: [
					{
						name: 'Spa',
						slug: 'spa',
					},
					{ name: 'Beach', slug: 'beach' },
					{ name: 'National Parks', slug: 'national-park' },
					{ name: 'Amusement Parks', slug: 'amusement-park' },
				],
			},
		]);
	}
);

app.use((err, req, res, next) => {
	if (err) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
});

// Server Listener
async function connectDbAndListen() {
	try {
		const {
			connection: { host, port },
		} = await mongoose.connect(process.env.MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`Database connected on ${host}:${port}`);

		if ((await LocationBudget.countDocuments()) < 1) {
			LocationBudget.create({ min: 0, max: 5000, label: 'Free - 5k' });
			LocationBudget.create({ min: 5000, max: 10000, label: '5k - 10k' });
			LocationBudget.create({ min: 10000, max: 20000, label: '10k - 20k' });
			LocationBudget.create({ min: 20000, max: undefined, label: '20k+' });
		}
	} catch (error) {
		console.log(error.message);
	}
	app.listen(process.env.PORT, () => {
		console.log(`Listening on http://localhost:${process.env.PORT}`);
	});
}
await connectDbAndListen();
