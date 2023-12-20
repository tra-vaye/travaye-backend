import dotenv from "dotenv";
import createPaystackApi from "paystack-api";
dotenv.config();

const paystack = createPaystackApi(process.env.PAYSTACK_API_SECRET_KEY);

export const verifyTrialPayment = async (req, res) => {
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
};

export const refundTrialPayment = async (req, res) => {
  const { paymentReference } = req.body;
  console.log(paymentReference);
  const refundAmount = 50 * 100;

  try {
    const refundRequestResponse = await paystack.refund.create({
      transaction: paymentReference,
      amount: refundAmount,
    });

    return res.status(200).json({
      success: true,
      message: "Refund request successful.",
      data: refundRequestResponse.data,
    });
  } catch (error) {
    console.error("Refund Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error during refund request.",
      data: error.response ? error.response.data : null,
    });
  }
};
