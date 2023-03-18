import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import passportLocal from "passport-local";
import { Business } from "./models/Business.model.js";
import { User } from "./models/User.model.js";
import userRouter from "./routes/user.routes.js";
const LocalStrategy = passportLocal.Strategy;

//Middlewares
const app = express();
dotenv.config();
app.use(express.json());
var whitelist = ["http://localhost:3000", "http://example2.com"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
// var whitelist = ["http://example1.com", "http://example2.com"];
// var corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (whitelist.indexOf(req.header("Origin")) !== -1) {
//     corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false }; // disable CORS for this request
//   }
//   callback(null, corsOptions); // callback expects two parameters: error and options
// };
app.use(cors(corsOptions));
app.use(
  session({
    secret: "LolSecretIsHere",
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
// Serialisation for Local Users
passport.use(User.createStrategy());
passport.use(Business.createStrategy());

passport.use("userLocal", new LocalStrategy(User.authenticate()));
passport.use("businessLocal", new LocalStrategy(Business.authenticate()));
// used to serialize the user for the session
passport.serializeUser(function (userObject, done) {
  let userGroup = "User";
  let userPrototype = Object.getPrototypeOf(userObject);
  if (userPrototype === User.prototype) {
    userGroup = "User";
  } else if (userPrototype === Business.prototype) {
    userGroup = "Business";
  }
  let sessionContructor = new SessionConstructor(userObject.id, userGroup, "");
  done(null, sessionContructor);
});
// deserialize the user
passport.deserializeUser(function (sessionContructor, done) {
  if (sessionContructor.userGroup === "User") {
    User.findById({ _id: sessionContructor.userId }, function (err, user) {
      done(err, user);
    });
  } else if (sessionContructor.userGroup === "Business") {
    Business.findById({ _id: sessionContructor.userId }, function (err, user) {
      done(err, user);
    });
  }
});

// Route Middlewares
app.use("/api/user", userRouter);

// Server Listener
async function connectDbAndListen() {
  try {
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Listening on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}
await connectDbAndListen();
