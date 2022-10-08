// Controllers are functions that are called depending on the user Route that is being accessed

// Necessary Imports
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Business } from "../models/businessModel.js";

// Token Generator
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "5d" });
};

// Gets all Business records
export const getAllBusinesses = async (req, res) => {
  try {
    let businesses = await Business.find({});
    //   Modifying the data to avoid revealing the businesses Hash
    businesses = businesses.map((business) => {
      const { _id, businessName, businessEmail, address } = business;
      business = { _id, businessName, businessEmail, address };
      return business;
    });
    return res.status(200).json(businesses);
  } catch (error) {
    return res.status(404).json(error);
  }
};

// Creates a new Business record
export const createNewBusinessAccount = async (req, res) => {
  const { businessName, businessEmail, address, password } = req.body;
  try {
    const createdUser = await Business.signup(
      businessName,
      address,
      businessEmail,
      password
    );
    const token = createToken(createdUser._id);
    //   Modifying the data to avoid revealing the users Hash
    let createdBusinessDoc = createdUser._doc;
    createdBusinessDoc = {
      _id: createdBusinessDoc._id,
      businessEmail: createdBusinessDoc.businessEmail,
      businessName: createdBusinessDoc.businessName,
      address: createdBusinessDoc.address,
    };
    return res.status(200).json({ token, ...createdBusinessDoc });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Updates an existing Business record
export const updateBusinessDetails = async (req, res) => {
  const updateData = req.body;
  const { id } = req.params;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updatedBusiness = await Business.findByIdAndUpdate(
        { _id: id },
        { ...updateData },
        { new: true }
      );
      return res.status(200).json(updatedBusiness);
    } catch (error) {
      return res.status(400).json(error);
    }
  } else {
    return res
      .status(403)
      .json({ error: "Wtf are you sending to me huh :-< " });
  }
};

// Deletes a Business record
export const deleteBusiness = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBusiness = await Business.findByIdAndDelete({ _id: id });
    return res.status(200).json(deletedBusiness);
  } catch (error) {
    return res.status(404).json(error);
  }
};

// Logs Business to their accounts and assigns a session token for them
export const businessLogin = async (req, res) => {
  const { businessEmail, password } = req.body;
  try {
    const loggedInBusiness = await User.login(businessEmail, password);
    const token = createToken(loggedInBusiness._id);
    let loggedInBusinessDoc = loggedInBusiness._doc;
    //   Modifying the data to avoid revealing the users Hash
    loggedInBusinessDoc = {
      _id: loggedInBusinessDoc._id,
      businessEmail: loggedInBusinessDoc.businessEmail,
      businessName: loggedInBusinessDoc.businessName,
      address: loggedInBusinessDoc.address,
    };
    return res.status(200).json({ token, ...loggedInBusinessDoc });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
