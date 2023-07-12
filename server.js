import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { createLocation } from './controllers/location.controllers.js';
import { Business } from './models/Business.model.js';
import { User } from './models/User.model.js';
import businessRouter from './routes/business.routes.js';
import locationRouter from './routes/location.routes.js';
import userRouter from './routes/user.routes.js';

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(morgan("common"));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

/* FILE STORAGE */

// Cloudinary
cloudinary.config({
	cloud_name: `${process.env.CLOUD_NAME}`,
	api_key: `${process.env.API_KEY}`,
	api_secret: `${process.env.API_SECRET}`,
});
// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
	cloudinary: cloudinary.v2,
	params: {
		folder: 'Assets',
		format: async (req, file) => 'webp', // Set the format of the uploaded image
		public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Set the public ID for the uploaded image
	},
});

// Initialize Multer upload middleware
const upload = multer({ storage });

var whitelist = [
	'http://localhost:3000',
	'http://www.localhost:3000',
	'http://172.20.10.9:3000',
	'http://www.172.20.10.9:3000',
	'https://travaye-beta.netlify.app',
	'https://www.travaye-beta.netlify.app',
];
var corsOptions = {
	origin: function (origin, callback) {
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
app.use(passport.session());
function SessionConstructor(userId, userGroup, details) {
	this.userId = userId;
	this.userGroup = userGroup;
	this.details = details;
}
passport.use(
	'userLocal',
	new LocalStrategy({ usernameField: 'username' }, User.authenticate())
);
const businessStrategy = new LocalStrategy(
	{
		usernameField: 'businessEmail',
		passwordField: 'password',
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
					return done(null, false, { message: 'Incorrect email or password.' });
				}

				return done(null, user);
			})
			.catch((err) => done(err));
	}
);
passport.use('businessLocal', businessStrategy);

// used to serialize the user for the session
passport.serializeUser(function (userObject, done) {
	let userGroup = 'User';
	let userPrototype = Object.getPrototypeOf(userObject);
	if (userPrototype === User.prototype) {
		userGroup = 'User';
	} else if (userPrototype === Business.prototype) {
		userGroup = 'Business';
	}
	let sessionContructor = new SessionConstructor(userObject.id, userGroup, '');
	done(null, sessionContructor);
});
// deserialize the user
passport.deserializeUser(function (sessionContructor, done) {
	if (sessionContructor.userGroup === 'User') {
		User.findById({ _id: sessionContructor.userId }, function (err, user) {
			done(err, user);
		});
	} else if (sessionContructor.userGroup === 'Business') {
		Business.findById({ _id: sessionContructor.userId }, function (err, user) {
			done(err, user);
		});
	}
});

// ROUTES WITH FILES
app.post(
	'/api/location',
	// (req, res, next) => {
	//   if (req.isAuthenticated()) {
	//     next();
	//   } else {
	//     res.status(403).json({ error: "Sorry you're not allowed in this Zone." });
	//   }
	// },
	upload.array('pictures'),
	createLocation
);

// ROUTES
app.use('/api/user', userRouter);
app.use('/api/business', businessRouter);
app.use('/api/location', locationRouter);

// Server Listener
async function connectDbAndListen() {
  try {
    const {connection: {host, port}} = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected on ${host}:${port}`);
    app.listen(process.env.PORT, () => {
      console.log(`Listening on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}
await connectDbAndListen();
