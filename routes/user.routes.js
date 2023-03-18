import express from "express";
import passport from "passport";
import { loginUser, registerUser } from "../controllers/user.controller.js";

// Created an express routing instance
const userRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Users and Get all Existing Users Data
userRouter.route("/").post(
  registerUser,
  passport.authenticate("userLocal", {
    successRedirect: `http://localhost:3000/home`,
    failureRedirect: `http://localhost:3000/login`,
  })
); // http://localhost:8080/api/user/
userRouter.route("/login").post(loginUser);

export default userRouter;
