import express from "express";
import passport from "passport";
import { getAllLocations } from "../controllers/location.controllers.js";

// Created an express routing instance
const locationRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Users and Get all Existing Users Data
locationRouter.route("/").get(getAllLocations); // http://localhost:8080/api/user/
locationRouter.route("/login").post(loginUser);
locationRouter.route("/verify").post(verifyUser);

export default locationRouter;
