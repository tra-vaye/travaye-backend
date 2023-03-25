import express from "express";
import passport from "passport";
import {
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/user.controller.js";

// Created an express routing instance
const userRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Users and Get all Existing Users Data
userRouter.route("/").post(registerUser, (req, res, next) => {
  passport.authenticate("userLocal", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      res.status(400).json({
        error: "A User with the given username or email exists",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ user });
    });
  })(req, res, next);
}); // http://localhost:8080/api/user/
userRouter.route("/login").post(loginUser);
userRouter.route("/verify").post(verifyUser);

export default userRouter;
