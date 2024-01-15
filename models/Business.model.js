// A Model File is For structuring and Exporting A single Instance of the required Model that is Needed For Saving Data or to Know which data to put in the database
// Where A Model itself is just the instance of the Schema Structure to apply CRUD in the database .

// Necessary Imports
import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";
import passportLocalMongoose from "passport-local-mongoose";

// User Schema Structure
const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      unique: true,
      required: true,
    },
    businessAddress: {
      type: String,
      // required: true,
    },
    businessLGA: {
      type: String,
      // required: true,
    },
    businessCity: {
      type: String,
      // required: true,
    },
    businessState: {
      type: String,
      // required: true,
    },
    businessPriceRangeFrom: {
      type: String,
      // required: true,
    },
    businessPriceRangeTo: {
      type: String,
      // required: true,
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
    verificationCode: {
      type: Number,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    businessVerified: {
      type: String,
      default: "false",
    },
    businessTelephone: {
      type: Number,
    },
    businessCategory: {
      type: String,
    },
    businessSubCategory: {
      type: String,
    },
    businessCacProofImageURL: {
      type: Array,
      default: [],
    },
    businessProofAddressImageURL: {
      type: Array,
      default: [],
    },
    businessLocationImages: {
      type: Array,
      default: [],
    },
    businessCardAuthorizationCode: {
      type: String,
    },
    businessCardBin: {
      type: String,
    },
    businessCardLast4Digit: {
      type: String,
    },
    businessCardExpiryMonth: {
      type: String,
    },
    businessCardExpiryYear: {
      type: String,
    },
    businessCardChannel: {
      type: String,
    },
    businessCardType: {
      type: String,
    },
    businessCardBank: {
      type: String,
    },
    businessCardCountryCode: {
      type: String,
    },
    businessCardBrand: {
      type: String,
    },
    businessCardReusable: {
      type: Boolean,
    },
    businessCardSignature: {
      type: String,
    },
    addedCard: {
      type: Boolean,
      default: false,
    },
    profilePhoto: String
  },
  {
    timestamps: true,
  }
);
const options = {
  usernameField: "businessEmail",
};
businessSchema.plugin(passportLocalMongoose, options);
businessSchema.plugin(findOrCreate);

// Exporting Model
export const Business = mongoose.model("Business", businessSchema);
