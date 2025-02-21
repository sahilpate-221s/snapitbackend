// import multer from "multer";

// const storage = multer.memoryStorage();

// const uploadFile = multer({ storage }).single("file");

// export default uploadFile;




import multer from "multer";

// Configure storage to keep files in memory
const storage = multer.memoryStorage();

// Change to handle multiple files under the field name "images"
const uploadFile = multer({ storage }).array("images", 10); // Allow up to 10 files

export default uploadFile;
