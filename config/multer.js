import cloudinary from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* FILE STORAGE */

// Cloudinary
cloudinary.config({
  cloud_name: `${process.env.CLOUD_NAME}`,
  api_key: `${process.env.API_KEY}`,
  api_secret: `${process.env.API_SECRET}`,
});
// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Assets",
    format: async (req, file) => "webp", // Set the format of the uploaded image
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Set the public ID for the uploaded image
  },
});

// Initialize Multer upload middleware
export const upload = multer({ storage });
export { cloudinary };
