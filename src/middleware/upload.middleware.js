import multer from "multer";

// Store file in memory (not on disk)
const storage = multer.memoryStorage();

// Optional: file size limit (e.g. 10MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Accept a single file with key name "file"
const uploadMiddleware = upload.single("file");

export default uploadMiddleware;
