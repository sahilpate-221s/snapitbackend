import cloudinary from 'cloudinary';

export const uploadImageToCloudinary = async (dataUrl, folder, height, quality) => {
  const options = { folder };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  options.resource_type = "auto";

  try {
    const result = await cloudinary.v2.uploader.upload(dataUrl, options);
    return result;
  } catch (error) {
    console.error(`Error while uploading image to Cloudinary: ${error.message}`);
    throw error;
  }
};
