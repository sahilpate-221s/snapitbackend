import { Collection } from "../model/collectionModel.js";
import cloudinary from "cloudinary";
import DataURIParser from "datauri/parser.js"; // Updated import path
import path from "path"; // Ensure path module is imported
import dotenv from "dotenv";

dotenv.config();

const parser = new DataURIParser();

/**
 * Create a new collection
 */
export const createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const newCollection = await Collection.create({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection: newCollection,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({
      message: "Error creating collection",
      error: error.message,
    });
  }
};

/**
 * Create a post in a collection
 */
export const createPostInCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const files = req.files; // Array of uploaded images


    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }
    const folderName = process.env.FOLDER_NAME; 

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const fileContent = parser.format(path.extname(file.originalname), file.buffer).content;
        const result = await cloudinary.v2.uploader.upload(fileContent, {
          folder: `${folderName}/collections/${collection.name}`,
        });
        return { id: result.public_id, url: result.secure_url };
      })
    );

    // Create the post object
    const newPost = {
      images: uploadedImages,
      createdBy: req.user._id,
    };

    // Add the post to the collection
    collection.posts.push(newPost);
    await collection.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully in the collection",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post in collection:", error);
    res.status(500).json({
      message: "Error creating post in collection",
      error: error.message,
    });
  }
};

/**
 * Get all collections by the current user
 */
export const getUserCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ createdBy: req.user._id });

    res.status(200).json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({
      message: "Error fetching collections",
      error: error.message,
    });
  }
};

/**
 * Remove a post from a collection
 */
export const removePostFromCollection = async (req, res) => {
  try {
    const { collectionId, postId } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const postIndex = collection.posts.findIndex(
      (post) => post._id.toString() === postId.toString()
    );

    if (postIndex === -1) {
      return res.status(404).json({ message: "Post not found in the collection" });
    }

    // Get the post being removed
    const post = collection.posts[postIndex];

    // Delete associated images from Cloudinary
    const imageDeletePromises = post.images.map(async (image) => {
      try {
        await cloudinary.v2.uploader.destroy(image.id); // Delete image by its public_id
      } catch (err) {
        console.error(`Error deleting image ${image.id} from Cloudinary:`, err.message);
      }
    });
    await Promise.all(imageDeletePromises);

    // Remove the post
    collection.posts.splice(postIndex, 1);
    await collection.save();

    res.status(200).json({
      success: true,
      message: "Post and associated images removed successfully",
      collection,
    });
  } catch (error) {
    console.error("Error removing post from collection:", error);
    res.status(500).json({
      message: "Error removing post from collection",
      error: error.message,
    });
  }
};


/**
 * Delete a collection
 */
export const deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this collection" });
    }

    // Delete associated images from Cloudinary
    const imageDeletePromises = collection.posts.flatMap((post) =>
      post.images.map(async (image) => {
        try {
          await cloudinary.v2.uploader.destroy(image.id); // Delete image by its public_id
        } catch (err) {
          console.error(`Error deleting image ${image.id} from Cloudinary:`, err.message);
        }
      })
    );
    await Promise.all(imageDeletePromises);

    // Delete the collection from the database
    await collection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Collection and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({
      message: "Error deleting collection",
      error: error.message,
    });
  }
};
