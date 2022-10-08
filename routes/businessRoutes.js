// Business Routing

// Necessary Imports
import express from "express";
import {
  businessLogin,
  createNewBusinessAccount,
  deleteBusiness,
  getAllBusinesses,
  updateBusinessDetails,
} from "../controllers/businessControllers.js";

// Created an express routing instance
const businessRouter = express.Router();

// Here I used chained routing to make the code length smaller .
// You can read more about it in Express Docs

// To add New business and Get all Existing business Data
businessRouter.route("/").get(getAllBusinesses).post(createNewBusinessAccount); // http://localhost:8080/api/business/

// To edit a business's Data and also Delete a business if the Need arise
businessRouter
  .route("/:id")
  .patch(updateBusinessDetails)
  .delete(deleteBusiness); // http://localhost:8080/api/business/<anyid> where "anyid" is a business mongoose unique id

// To Login a business
businessRouter.route("/login").post(businessLogin); // http://localhost:8080/api/business/login

// Exporting Router
export default businessRouter;
