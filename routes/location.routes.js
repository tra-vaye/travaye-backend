import express from "express";
import {
  addLocationtoLikedLocations,
  createLocation,
  getAllLocations,
  getLocationById,
  planTrip,
  reviewLocation,
} from "../controllers/location.controllers.js";
// import multer
import passport from "passport";
import { upload } from "../config/multer.js";

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

locationRouter.get(
  "/plan",
  passport.authenticate(["business", "jwt"], { session: false }),
  planTrip
);
locationRouter.get(
  "/:id",
  passport.authenticate(["business", "jwt"], { session: false }),
  getLocationById
);
locationRouter.post(
  "/like",
  passport.authenticate(["business", "jwt"], { session: false }),
  addLocationtoLikedLocations
);
locationRouter.post(
  "/review",
  passport.authenticate(["business", "jwt"], { session: false }),
  upload.array("pictures"),
  reviewLocation
);

export default locationRouter;
