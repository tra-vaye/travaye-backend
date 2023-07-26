import express from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
} from "../controllers/location.controllers.js";
// import multer
import { upload } from "../config/multer.js";
import passport from "passport";

// Created an express routing instance
const locationRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New Locations and Get all Existing Location Data
locationRouter
  .route("/")
  .get(getAllLocations)
  .post(
    passport.authenticate(["business", "jwt"], { session: false }),
    upload.array("pictures"),
    createLocation
  ); // http://localhost:8080/api/location/

  locationRouter.get('/:id', passport.authenticate(['business', 'jwt'], { session: false }), getLocationById);
export default locationRouter;
