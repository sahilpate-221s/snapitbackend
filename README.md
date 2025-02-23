# SnapIt - Backend  

🚀 **Frontend Repo:** [SnapIt Frontend]("https://snapitbackend.onrender.com")  

## 📌 Tech Stack  

- **MongoDB** → NoSQL database for storing user data  
- **Express.js** → Backend framework for handling API requests  
- **React** → Frontend framework (used in the frontend repo)  
- **Node.js** → JavaScript runtime for server-side logic  
- **Mongoose** → ODM for interacting with MongoDB  
- **JWT (JSON Web Token)** → Authentication and authorization  
- **Cloudinary** → Image storage and management  
- **Bcrypt.js** → Password hashing for security  
- **Cors** → Cross-origin resource sharing for API access  
- **Dotenv** → Environment variable management  

## 💡 Features  

- 🔐 **User Authentication**: Secure login/signup with JWT  
- 📸 **Image Uploading**: Store and retrieve images using Cloudinary  
- 📂 **RESTful APIs**: CRUD operations for users and posts  
- 🔄 **Secure Data Handling**: Encrypted passwords and authentication  
- ⚡ **Optimized Performance**: Efficient API responses and error handling  

## 📂 Project Setup  

To run the backend locally, follow these steps:  

```sh
# Clone the repository
git clone <backend-repo-url>

# Navigate to the backend directory
cd snapit-backend

# Install dependencies
npm install

# Create a .env file and add the following variables
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Start the development server
npm run dev
