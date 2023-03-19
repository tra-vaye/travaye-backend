import bcrypt from "bcryptjs";
import passport from "passport";
import { Business } from "../models/Business.model.js";

export const registerBusiness = async (req, res, next) => {
  const businessName = req.body.businessName;
  const businessEmail = req.body.businessEmail;
  const password = req.body.password;
  const address = req.body.address;

  // Encryption
  const salt = await bcrypt.genSalt(13);
  const hashedPassword = await bcrypt.hash(password, salt);
  let verificationCode = Math.floor(Math.random() * 9000) + 1000;

  // Display the verificationCode
  console.log(verificationCode);
  Business.register(
    {
      businessName: businessName,
      businessEmail: businessEmail,
      address: address,
      password: hashedPassword,
      verificationCode: verificationCode,
    },
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(400).json({
          error: "A Business with the given username or email exists",
        });
      } else if (!err) {
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginBusiness = (req, res, next) => {
  passport.authenticate("businessLocal", function (err, user, info) {
    console.log(user);
    if (err) {
      return next(err);
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ user });
    });
  })(req, res, next);
};
export const currentUser = (req, res) => {
  if (req.isAuthenticated()) {
    return req.user;
  }
};
// Logout
export const logBusinessOut = (req, res) => {
  req.logOut();
  res.redirect("/login");
};
