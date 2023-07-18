import bcrypt from "bcryptjs";
import passport from "passport";
import { Business } from "../models/Business.model.js";

import jwt from "jsonwebtoken";

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {import("express").NextFunction} next
 */
export const registerBusiness = async (req, res, next) => {
  // const businessName = req.body.businessName;
  // const businessEmail = req.body.businessEmail;
  // const password = req.body.password;
  // const address = req.body.address;
  const { businessName, businessEmail, password, address } = req.body;

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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        req.headers.authorization = `Bearer ${token}`;
        // sendVerifyEmail(businessEmail, verificationCode);
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginBusiness = async (req, res, next) => {
  // passport.authenticate("businessLocal", function (err, user, info) {
  //   console.log(user);
  //   if (err) {
  //     return next(err);
  //   }
  //   if (!user) {
  //     // *** Display message without using flash option
  //     // re-render the login form with a message
  //     return res.status(400).json({
  //       error: "Invalid email or password",
  //     });
  //   }
  //   req.logIn(user, function (err) {
  //     if (err) {
  //       return next(err);
  //     }
  //     return res.status(200).json({ user });
  //   });
  // })(req, res, next);
  const { businessEmail: email, password } = req.body;

  const business = await Business.findOne({ businessEmail: email });

  if (!business) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, business.password);
  if (!isMatch) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }

  const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({
    token,
    business,
  });
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
