// A Model File is For structuring and Exporting A single Instance of the required Model that is Needed For Saving Data or to Know which data to put in the database
// Where A Model itself is just the instance of the Schema Structure to apply CRUD in the database .

// Necessary Imports
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

// User Schema Structure
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sign up Static Method on Model
userSchema.statics.signup = async function (
  username,
  password,
  email,
  fullname
) {
  if (!email || !password || !fullname || !username) {
    throw Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not Valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Weak Password");
  }
  const ifEmailExists = await this.findOne({ email });
  if (ifEmailExists) {
    throw Error("Email in use");
  }
  // Encryption
  const salt = await bcrypt.genSalt(13);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User Record
  const user = await this.create({
    email,
    password: hashedPassword,
    username,
    fullname,
  });
  return user;
};

// Static Login Method on Model
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Can't find matching credentials. Check and try again");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect Password");
  }
  return user;
};

// Exporting Model
export const User = mongoose.model("User", userSchema);
