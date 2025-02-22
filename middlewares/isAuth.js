import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

const isAuth = async (req, res, next) => {
  try {
    let token;

    // Extract token from cookies, body, or headers
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.body && req.body.token) {
      token = req.body.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token, return 403 error
    if (!token) {
      return res.status(403).json({
        message: "Please login to access",
        success: false,
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    // Find user by ID from the decoded token
    req.user = await User.findById(decoded.id).select("-password");

    // If user is not found, return an error
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Move to the next middleware
    next();
  } catch (error) {
    console.error("Auth Error:", error.message); // Log error for debugging
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default isAuth;
