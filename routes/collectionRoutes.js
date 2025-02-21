import express from "express";
import {
  createCollection,
  createPostInCollection,
  getUserCollections,
  removePostFromCollection,
  deleteCollection,
} from "../controllers/collectionController.js";
import isAuth from "../middlewares/isAuth.js"; // Assuming authentication middleware
import uploadFile from "../middlewares/multer.js"; // Assuming multer setup

const router = express.Router();

// Route to create a new collection
router.post("/createCollection", isAuth, createCollection);

// Route to get all collections of the current user
router.get("/all-Collections", isAuth, getUserCollections);

// Route to add a new post to a collection
router.post(
  "/:collectionId/posts",isAuth,uploadFile, // Middleware to handle image uploads
  createPostInCollection
);

// Route to remove a post from a collection
router.delete("/delete-posts", isAuth, removePostFromCollection);

// Route to delete a collection
router.delete("/:collectionId", isAuth, deleteCollection);

export default router;
