// User Routing

// Necessary Imports
import express from "express";
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  updateUserDetails,
  userLogin,
} from "../controllers/userControllers.js";

// Created an express routing instance
const userRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Users and Get all Existing Users Data
userRouter.route("/").get(getAllUsers).post(createNewUser); // http://localhost:8080/api/user/

// To edit a User's Data and also Delete a User if the Need arise
userRouter.route("/:id").patch(updateUserDetails).delete(deleteUser); // http://localhost:8080/api/user/<anyid> where "anyid" is a user mongoose unique id

// To Login a User
userRouter.route("/login").post(userLogin); // http://localhost:8080/api/user/login

// Exporting Router
export default userRouter;
