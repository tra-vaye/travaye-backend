import bcrypt from "bcryptjs";
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
import businessRouter from "./routes/business.routes.js";
import userRouter from "./routes/user.routes.js";
const LocalStrategy = passportLocal.Strategy;

//Middlewares
const app = express();
dotenv.config();
app.use(express.json());
var whitelist = [
  "http://localhost:3000",
  "http://www.localhost:3000",
  "http://172.20.10.9:3000",
  "http://www.172.20.10.9:3000",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

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
// Serialisation for Local Usersf
// passport.use(User.createStrategy());
// passport.use(Business.createStrategy());

passport.use(
  "userLocal",
  new LocalStrategy({ usernameField: "username" }, User.authenticate())
);
const businessStrategy = new LocalStrategy(
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
passport.use("businessLocal", businessStrategy);

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
// const localStrategy2 = new LocalStrategy(
//   {
//     usernameField: "email",
//     passwordField: "password",
//     session: false,
//   },
//   function (email, password, done) {
//     // find user by email and password using Model2
//     Business.findOne(
//       { email: email, password: password },
//       function (err, user) {
//         if (err) {
//           return done(err);
//         }
//         if (!user) {
//           return done(null, false, { message: "Incorrect email or password." });
//         }
//         return done(null, user);
//       }
//     );
//   }
// );

// Route Middlewares
app.use("/api/user", userRouter);
app.use("/api/business", businessRouter);

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
