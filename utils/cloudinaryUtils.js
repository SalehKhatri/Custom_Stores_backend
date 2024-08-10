const cloudinary = require('cloudinary').v2;
const fs = require("fs")
// Cloudinary configuration (set your Cloudinary credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to delete the local image file
const deleteLocalImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete local file: ${filePath}`, err);
    } else {
      console.log(`Successfully deleted local file: ${filePath}`);
    }
  });
};

// Function to upload an image to Cloudinary
const uploadImageToCloudinary = async (path) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        // Delete the local image file after upload
        deleteLocalImage(path);
        resolve(result.secure_url);
      }
    });
  });
};

module.exports = {uploadImageToCloudinary}