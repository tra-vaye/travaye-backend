import express from "express";
import passport from "passport";
import {
  refundTrialPayment,
  verifyTrialPayment,
} from "../controllers/paystack.controller.js";

const payRouter = express.Router();

payRouter
  .route("/verifyTrial")
  .post(
    passport.authenticate("business", { session: false }),
    verifyTrialPayment
  );

payRouter
  .route("/refundTrial")
  .post(
    passport.authenticate("business", { session: false }),
    refundTrialPayment
  );
export default payRouter;
