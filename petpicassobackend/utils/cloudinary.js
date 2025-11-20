import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary from URL
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} folder - The folder to upload to (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImageFromUrl = async (imageUrl, folder = 'petpicasso/generated', publicId = null) => {
  try {
    const options = {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(imageUrl, options);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      cloudinaryResult: result
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - The folder to upload to (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImageBuffer = async (buffer, folder = 'petpicasso/generated', publicId = null) => {
  try {
    return new Promise((resolve, reject) => {
      const options = {
        folder: folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (publicId) {
        options.public_id = publicId;
      }

      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject({
              success: false,
              error: error.message
            });
          } else {
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              cloudinaryResult: result
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a unique public ID for images
 * @param {string} userEmail - User's email for uniqueness
 * @param {string} style - Art style name
 * @returns {string} - Unique public ID
 */
export const generatePublicId = (userEmail, style) => {
  const timestamp = Date.now();
  const emailHash = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous';
  const styleClean = style ? style.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 'default';
  
  return `${emailHash}_${styleClean}_${timestamp}`;
};

export default cloudinary;