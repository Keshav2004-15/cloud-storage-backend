import multer from "multer";

/**
 * We use memoryStorage because:
 * - Files are immediately uploaded to Supabase
 * - No need to store files on backend disk
 */
const storage = multer.memoryStorage();

/**
 * Multer configuration
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Optional security: allow all for now
    cb(null, true);
  }
});

/**
 * Accept a single file with key name "file"
 */
const uploadMiddleware = upload.single("file");

export default uploadMiddleware;

