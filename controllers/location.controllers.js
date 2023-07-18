import dotenv from "dotenv";
import { Location } from "../models/Location.model.js";

// This function works as an organizer for multiple images to avoid images having same name
dotenv.config();

const saveImagesWithModifiedName = async (files, productName) => {
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

export const createLocation = async (req, res) => {
  const {
    name: locationName,
    address: locationAddress,
    // locationRating,
    // locationContact,
    // picturePath,
    description: locationDescription,
    addeddBy: locationAddedBy,
  } = req.body;

  const existingLocation = await Location.findOne({
    locationName: locationName,
  }).then((err, location) => {
    if (err) {
      console.error(err.message);
      return err;
    } else if (location) {
      return location;
    }
  });

  try {
    const files = req.files;

    if (!files || files.length === 0) {
      throw new Error("No files uploaded!");
    }
    const images = req.files;

    if (existingLocation) {
      console.log(existingLocation);
      return res.status(400).json({ message: "Location already exist." });
    } else {
      if (!existingLocation) {
        const newLocation = new Location({
          locationName: locationName,
          locationAddress: locationAddress,
          locationContact: "",
          locationDescription: locationDescription,
          locationRating: "",
          locationImagePath: await saveImagesWithModifiedName(
            images,
            locationName.replace(/\s/g, "-")
          ),
          locationCategory: "wildlife-attractions",
          locationAddedBy,
        });
        const savedLocation = await newLocation.save();
        return res.status(200).json(savedLocation);
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ error: "Failed to add location" });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    return res.status(200).json({ locations });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
