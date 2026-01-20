import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../middleware/upload.middleware.js";

import {
  uploadFile,
  listFiles,
  renameFile,
  deleteFile
} from "../controllers/file.controller.js";

const router = express.Router();

/* =========================
   UPLOAD FILE (Day 10)
   POST /files/upload
   ========================= */
router.post(
  "/upload",
  authMiddleware,       // JWT verification
  uploadMiddleware,     // Multer (memory storage)
  uploadFile            // Supabase upload + DB save
);

/* =========================
   LIST FILES
   GET /files
   GET /files?folder_id=xxx
   ========================= */
router.get(
  "/",
  authMiddleware,
  listFiles
);

/* =========================
   RENAME FILE
   PUT /files/:id
   ========================= */
router.put(
  "/:id",
  authMiddleware,
  renameFile
);

/* =========================
   DELETE FILE (SOFT DELETE)
   DELETE /files/:id
   ========================= */
router.delete(
  "/:id",
  authMiddleware,
  deleteFile
);

export default router;

