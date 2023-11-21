import bcrypt from "bcryptjs";
import { Business } from "../models/Business.model.js";

import jwt from "jsonwebtoken";
import sendVerifyEmail from "../services/index.service.js";
const saveImagesWithModifiedName = async (files) => {
  const imageUrls = [];
  // console.log(files);
  try {
    files.map((file) => imageUrls.push(file.path));
  } catch (err) {
    console.error(err);
    throw new Error(`Error uploading images: ${err.message}`);
  }
  return imageUrls;
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {import("express").NextFunction} next
 */
export const registerBusiness = async (req, res, next) => {
  // const businessName = req.body.businessName;
  // const businessEmail = req.body.businessEmail;
  // const password = req.body.password;
  // const address = req.body.address;
  const { businessName, businessEmail, password, address } = req.body;

  // Encryption
  const salt = await bcrypt.genSalt(13);
  const hashedPassword = await bcrypt.hash(password, salt);
  let verificationCode = Math.floor(Math.random() * 9000) + 1000;

  // Display the verificationCode
  // console.log(verificationCode);
  Business.register(
    {
      businessName: businessName,
      businessEmail: businessEmail,
      address: address,
      password: hashedPassword,
      verificationCode: verificationCode,
    },
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(400).json({
          error: "A Business with the given username or email exists",
        });
      } else if (!err) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        req.headers.authorization = `Bearer ${token}`;
        sendVerifyEmail(businessEmail, verificationCode);
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginBusiness = async (req, res, next) => {
  // passport.authenticate("businessLocal", function (err, user, info) {
  //   console.log(user);
  //   if (err) {
  //     return next(err);
  //   }
  //   if (!user) {
  //     // *** Display message without using flash option
  //     // re-render the login form with a message
  //     return res.status(400).json({
  //       error: "Invalid email or password",
  //     });
  //   }
  //   req.logIn(user, function (err) {
  //     if (err) {
  //       return next(err);
  //     }
  //     return res.status(200).json({ user });
  //   });
  // })(req, res, next);
  const { businessEmail: email, password } = req.body;

  const business = await Business.findOne({ businessEmail: email });

  if (!business) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, business.password);
  if (!isMatch) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }

  const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  business.password = undefined;
  business.verificationCode = undefined;
  return res.status(200).json({
    token,
    user: business,
  });
};

export const currentUser = (req, res) => {
  const user = req.user;
  user.password = undefined;
  user.verificationCode = undefined;
  return res.status(200).json({ user });
};
// Logout
export const logBusinessOut = (req, res) => {
  req.logOut();
  res.redirect("/login");
};
export const verifyBusiness = async (req, res) => {
  const verificationCode = req.body?.code;

  const user = req.user;
  const isMatch = +verificationCode === user.verificationCode;
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid Code" });
  }
  // const verifiedUser = await User.findByIdAndUpdate(
  //   { _id: _id },
  //   { verified: true },
  //   { new: true }
  // );
  user.emailVerified = true;
  await user.save();
  res.status(200).json({ user });
};

export const completeBusinessRegistration = async (req, res) => {
  try {
    const {
      businessName,
      address,
      businessCategory,
      businessEmail,
      businessTelephone,
    } = req?.body;

    const businessLocationImages = req.files.businessLocationImages;
    const cacRegistrationProof = req.files.cacRegistrationProof;
    const proofOfAddress = req.files.proofOfAddress;

    const business = req.user;
    console.log(req.user);
    console.log(businessName);
    business.businessName = businessName;
    business.address = address;
    business.businessCategory = businessCategory
      .toLowerCase()
      .replace(/\s+/g, "-");
    business.businessEmail = businessEmail;
    business.businessTelephone = businessTelephone;
    business.businessCacProofImageURL = await saveImagesWithModifiedName(
      cacRegistrationProof
    );
    business.businessProofAddressImageURL = await saveImagesWithModifiedName(
      proofOfAddress
    );
    business.businessLocationImages = await saveImagesWithModifiedName(
      businessLocationImages
    );
    business.businessVerified = "pending";

    const pendingVerification = await business.save();
    return res.status(200).json({ pendingVerification });
  } catch (error) {
    return res.status(400).json({
      error: "Failed to update business details",
      message: error.message,
    });
  }
};
