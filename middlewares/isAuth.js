import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(403).json({
        message: "Please login to access",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({
        message: "Token expired",
        success: false,
      });
    }

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Please login to access",
    });
  }
};

export default isAuth;