import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import configureCloudinary from "./config/cloudinary.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// use middleware
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: 'https://snapit1.netlify.app/',
		// origin: 'http://192.168.208.80:5173',
		credentials: true,
	})
);

// configure cloudinary
configureCloudinary();

// connect to database
connectDB();

//setting up router
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/collection", collectionRoutes);


// app.get("/", (req, res) => {
// 	res.send("Hello");
//   });
  
// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
