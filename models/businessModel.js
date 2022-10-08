// A Model File is For structuring and Exporting A single Instance of the required Model that is Needed For Saving Data or to Know which data to put in the database
// Where A Model itself is just the instance of the Schema Structure to apply CRUD in the database .

// Necessary Imports
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

// User Schema Structure
const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    businessEmail: {
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
businessSchema.statics.signup = async function (
  businessName,
  address,
  businessEmail,
  password
) {
  if (!businessEmail || !password || !businessName || !address) {
    throw Error("All fields are required");
  }
  if (!validator.isEmail(businessEmail)) {
    throw Error("Email is not Valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Weak Password");
  }
  const ifEmailExists = await this.findOne({ businessEmail });
  if (ifEmailExists) {
    throw Error("Email in use");
  }
  const ifBusinessNameExists = await this.findOne({ businessName });
  if (ifBusinessNameExists) {
    throw Error("This Business Name is not available. Try another");
  }
  // Encryption
  const salt = await bcrypt.genSalt(13);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create Business Record
  const business = await this.create({
    businessEmail,
    password: hashedPassword,
    businessName,
    address,
  });
  return business;
};

// Static Login Method on Model
businessSchema.statics.login = async function (businessEmail, password) {
  if (!businessEmail || !password) {
    throw Error("All fields are required");
  }
  const business = await this.findOne({ businessEmail });
  if (!business) {
    throw Error("Can't find matching credentials. Check and try again");
  }
  const match = await bcrypt.compare(password, business.password);
  if (!match) {
    throw Error("Incorrect Password");
  }
  return business;
};

// Exporting Model
export const Business = mongoose.model("Business", businessSchema);
