import express from "express";
import {
  createLocation,
  getAllLocations,
} from "../controllers/location.controllers.js";

// Created an express routing instance
const locationRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Locations and Get all Existing Location Data
locationRouter.route("/").get(getAllLocations); // http://localhost:8080/api/location/

export default locationRouter;
