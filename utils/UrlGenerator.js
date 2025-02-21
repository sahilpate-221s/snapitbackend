// import DataUriParser from "datauri/parser.js";
// import path from "path";

// const getDataUrl = (file) => {
//   if (!file || !file.originalname || !file.buffer) {
//     throw new Error("Invalid file object");
//   }

//   const parser = new DataUriParser();
//   const extName = path.extname(file.originalname).toString();
//   return parser.format(extName, file.buffer);
// };

// export default getDataUrl;





import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUrls = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("Invalid files array");
  }

  const parser = new DataUriParser();

  return files.map((file) => {
    if (!file || !file.originalname || !file.buffer) {
      throw new Error("Invalid file object");
    }

    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer); // Returns { content: "data:<mimetype>;base64,<data>" }
  });
};

export default getDataUrls;
