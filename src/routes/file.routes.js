import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../middleware/upload.middleware.js";
import { uploadFile } from "../controllers/file.controller.js";

const router = express.Router();

// POST /files/upload
router.post(
  "/upload",
  authMiddleware,       // 1️⃣ JWT check
  uploadMiddleware,     // 2️⃣ Multer handles file
  uploadFile            // 3️⃣ Controller logic
);

export default router;
