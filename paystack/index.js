import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import createPaystackApi from "paystack-api";
dotenv.config();

const paystack = createPaystackApi(process.env.PAYSTACK_API_SECRET_KEY);
const payRouter = express.Router();

payRouter.post(
  "/verify",
  passport.authenticate("business", { session: false }),
  async (req, res) => {
    const { reference } = req.body;

    try {
      const verifyResponse = await paystack.transaction.verify({ reference });

      if (verifyResponse.data.status === "abandoned") {
        return res.json({
          success: false,
          message: "Payment pending.",
          reference,
        });
      } else {
        const {
          authorization_code,
          bin,
          last4,
          exp_month,
          exp_year,
          channel,
          card_type,
          bank,
          country_code,
          brand,
          reusable,
          signature,
        } = verifyResponse.data.authorization;
        const user = req.user;
        user.businessCardAuthorizationCode = authorization_code;
        user.businessCardBin = bin;
        user.businessCardLast4Digit = last4;
        user.businessCardExpiryMonth = exp_month;
        user.businessCardExpiryYear = exp_year;
        user.businessCardChannel = channel;
        user.businessCardType = card_type;
        user.businessCardBank = bank;
        user.businessCardCountryCode = country_code;
        user.businessCardBrand = brand;
        user.businessCardReusable = reusable;
        user.businessCardSignature = signature;
        user.addedCard = true;
        await user.save();
        return res.json({
          success: true,
          message: "Payment successful.",
          reference,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error during payment verification.",
        reference,
      });
    }
  }
);

export default payRouter;
