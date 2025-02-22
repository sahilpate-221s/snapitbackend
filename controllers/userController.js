import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import dotenv from "dotenv";
import { Post } from "../model/postModel.js";
import { Collection } from "../model/collectionModel.js";

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password do not match. Please try again.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bio: "", // Empty default bio
      profilePicture: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN || "24h", // Default expiry 24 hour
    });

    // Set token in HTTP-only cookie
    // res.cookie("token", token, {
    //   httpOnly: true, // Ensures cookie is not accessible via JavaScript
    //   sameSite: "strict", // Prevents CSRF attacks
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    //   path: "/",
    // });

    res.cookie("token", token, {
  httpOnly: true, 
  secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", 
  maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
});


    // Do not send password or token in the response body
    user.password = undefined;

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token, // i should remove that
    });
  } catch (error) {
    console.error(`Error while registering user: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error while registering user",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all the required fields",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered with us. Please sign up to continue",
      });
    }

    // Compare the password with the hashed password
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN || "24h", // Token expiry time
    });

    // Set token in HTTP-only cookie
    // res.cookie("token", token, {
    //   httpOnly: true, // Makes cookie inaccessible to client-side JavaScript
    //   sameSite: "none", // Helps prevent CSRF attacks
    //   maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
    //   path: "/",
    // });

    res.cookie("token", token, {
  httpOnly: true, 
  secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", 
  maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
});


    // Do not expose password in the response
    user.password = undefined;

    // Send successful login response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      token, //should remove that
    });
  } catch (error) {
    console.error(`Error while logging in user: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error while logging in user",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    console.log("Logout function triggered"); // Debugging log

    res.cookie("token", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  expires: new Date(0), // Expire immediately
});


    console.log("Cookie cleared, sending response"); // Debugging log

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(`Error while logging out user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while logging out user",
    });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json(user);
  } catch (error) {
    console.error(`Error while getting user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while getting user profile",
    });
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(`Error while getting user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while getting user profile",
    });
  }
};

export const followAndUnfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // jisko follow karna hai
    const loggedInUser = await User.findById(req.user._id); // meri id hai jo login hai

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "no user with this id",
      });
    }
    // check for self follow unfollow
    if (user._id.toString() === loggedInUser._id.toString())
      return res.status(400).json({
        message: "you can't follow yourself",
      });

    // agar user ko phle se follow kiya hai to unfollow kar denge
    if (user.followers.includes(loggedInUser._id)) {
      const indexFollowing = loggedInUser.following.indexOf(user._id); // uesr id kis index me hia wo pta kar lenge
      const indexFollowers = user.followers.indexOf(loggedInUser._id);

      loggedInUser.following.splice(indexFollowing, 1); // following se user ko delete kar denge jis bhi index me hoga
      user.followers.splice(indexFollowers, 1); // followers se user ko delete kar denge jis bhi index me hoga

      await loggedInUser.save();
      await user.save();

      res.json({
        message: "User Unfollowed",
      });
    } // else case jab user ko follow nahi kiya hua hai
    else {
      loggedInUser.following.push(user._id);
      user.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await user.save();

      res.json({
        message: "User followed",
      });
    }
  } catch (error) {
    console.error(`Error while following user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while following user",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, bio, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(`Error while updating profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(`Error while changing password: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while changing password",
    });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById({ _id: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete({
      _id: id,
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(`Error while deleting account: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting account",
    });
  }
};

export const getFollowersAndFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers following",
      "name profilePicture"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error(
      `Error while getting followers and following: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error while getting followers and following",
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.id });

    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "No posts found for this user",
      });
    }

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(`Error while getting user's posts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while getting user's posts",
    });
  }
};

export const getUserCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ createdBy: req.params.id });

    if (!collections) {
      return res.status(404).json({
        success: false,
        message: "No collections found for this user",
      });
    }

    res.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error(`Error while getting user's collections: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while getting user's collections",
    });
  }
};

export const updateDisplayPicture = async (req, res) => {
  try {
    // Check if the display picture file is provided
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No display picture file provided",
      });
    }

    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    // Upload the image to Cloudinary
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    console.log(image);

    // Update the user's profile picture URL in the database
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { profilePicture: image.secure_url },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: updatedProfile.profilePicture,
    });
  } catch (error) {
    console.error(`Error while updating display picture: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating display picture",
    });
  }
};
