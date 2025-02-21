import cloudinary from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

const configureCloudinary = () => {
    try {
        cloudinary.v2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
        console.log("Cloudinary configured successfully");
    } catch (error) {
        console.log(`Error while configuring Cloudinary: ${error.message}`);
    }
};

export default configureCloudinary;
