// A Model File is For structuring and Exporting A single Instance of the required Model that is Needed For Saving Data or to Know which data to put in the database
// Where A Model itself is just the instance of the Schema Structure to apply CRUD in the database .

// Necessary Imports
import mongoose from "mongoose";

// User Schema Structure
const locationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      unique: true,
      required: true,
    },
    locationAddress: {
      type: String,
      required: true,
    },
    locationCity: {
      type: String,
      required: true,
    },
    locationContact: {
      type: Number,
      // required: true,
    },
    locationRating: {
      type: Number,
      // required: true,
    },
    locationDescription: {
      type: String,
      required: true,
    },
    locationImagePath: {
      type: Array,
      default: [],
    },
    locationCategory: {
      type: String,
    },
    locationAddedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Exporting Model
export const Location = mongoose.model("Location", locationSchema);
