import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import {
  currentUser,
  loginBusiness,
  registerBusiness,
} from "../controllers/business.controller.js";

const businessRouter = express.Router();

// To add New Business and current logged in Business Data
businessRouter
  .route("/")
  .get(currentUser)
  .post(registerBusiness, (req, res, next) => {
    passport.authenticate("business", function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        // *** Display message without using flash option
        // re-render the login form with a message
        res.status(400).json({
          error: "No Business Found",
        });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({ business: user, token });
    })(req, res, next);
  }); // http://localhost:8080/api/business/
businessRouter.route("/login").post(loginBusiness);
export default businessRouter;
