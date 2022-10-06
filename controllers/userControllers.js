// Controllers are functions that are called depending on the user Route that is being accessed

// Necessary Imports
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

// Token Generator
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// Gets all Users records
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    return res.status(404).json(error);
  }
};

// Creates a new User record
export const createNewUser = async (req, res) => {
  const { username, password, email, fullname } = req.body;
  try {
    const createdUser = await User.signup(username, password, email, fullname);
    const token = createToken(createdUser._id);
    return res.status(200).json({ token, ...createdUser._doc });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Updates an existing User record
export const updateUserDetails = async (req, res) => {
  const updateData = req.body;
  const { id } = req.params;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        { _id: id },
        { ...updateData },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(400).json(error);
    }
  } else {
    return res
      .status(403)
      .json({ error: "Wtf are you sending to me huh :-< " });
  }
};

// Deletes a User record
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete({ _id: id });
    return res.status(200).json(deletedUser);
  } catch (error) {
    return res.status(404).json(error);
  }
};

// Logs User to their accounts and assigns a session token for them
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const loggedInUser = await User.login(email, password);
    const token = createToken(loggedInUser._id);

    return res.status(200).json({ token, ...loggedInUser._doc });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
