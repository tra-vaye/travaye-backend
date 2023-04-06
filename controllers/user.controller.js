import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User.model.js";
import sendVerifyEmail from "../services/index.service.js";

export const registerUser = async (req, res, next) => {
  const username = req.body?.username;
  const email = req.body?.email;
  const password = req.body?.password;
  const fullName = req.body?.fullName;

  // Encryption
  const salt = await bcrypt.genSalt(13);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Random Four digit code
  // Generate a random 4-digit code
  let verificationCode = Math.floor(Math.random() * 9000) + 1000;
  User.register(
    {
      username: username,
      email: email,
      fullName: fullName,
      password: hashedPassword,
      verificationCode: verificationCode,
    },
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(400).json({
          error: "A User with the given username or email exists",
        });
      } else if (!err) {
        sendVerifyEmail(email, verificationCode);
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginUser = (req, res, next) => {
  passport.authenticate("userLocal", function (err, user, info) {
    console.log(user);
    if (err) {
      return next(err);
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      user.password = undefined;
      return res.status(200).json({ user });
    });
  })(req, res, next);
};
// Logout
export const logUserOut = (req, res) => {
  req.logOut();
  res.redirect("/login");
};
// Verify
export const verifyUser = async (req, res) => {
  const verificationCode = req.body?.verificationCode;
  const _id = req.body?._id;

  // Find User
  const unverifiedUser = await User.findById({ _id: _id });
  const isMatch = +verificationCode === unverifiedUser.verificationCode;
  if (!isMatch) {
    res.status(400).json({ error: "Invalid Code" });
  }
  const verifiedUser = await User.findByIdAndUpdate(
    { _id: _id },
    { verified: true },
    { new: true }
  );
  res.status(200).json({ user: verifiedUser });
};
