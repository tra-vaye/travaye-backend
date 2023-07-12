import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User.model.js";
import sendVerifyEmail from "../services/index.service.js";
import jwt from 'jsonwebtoken';

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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        req.headers.authorization = `Bearer ${token}`;
        sendVerifyEmail(email, verificationCode);
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginUser = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(400).json({
      error: "Invalid username or password",
    });
  }

  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    return res.status(400).json({
      error: "Invalid username or password",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  return res.status(200).json({token});
};
// Logout
export const logUserOut = (req, res) => {
  req.logOut();
  res.redirect("/login");
};
// Verify
export const verifyUser = async (req, res) => {
  const verificationCode = req.body?.verificationCode;

  const user = req.user;
  const isMatch = +verificationCode === user.verificationCode;
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid Code" });
  }
  // const verifiedUser = await User.findByIdAndUpdate(
  //   { _id: _id },
  //   { verified: true },
  //   { new: true }
  // );
  user.verified = true;
  await user.save();
  res.status(200).json({ user });
};
