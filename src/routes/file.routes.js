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
   UPLOAD FILE (Day-3)
   POST /files/upload
   ========================= */
router.post(
  "/upload",
  authMiddleware,       // JWT verification
  uploadMiddleware,     // Multer handles file
  uploadFile            // Upload + DB save
);

/* =========================
   LIST FILES (Day-4)
   GET /files
   GET /files?folder_id=xxx
   ========================= */
router.get(
  "/",
  authMiddleware,
  listFiles
);

/* =========================
   RENAME FILE (Day-4)
   PUT /files/:id
   ========================= */
router.put(
  "/:id",
  authMiddleware,
  renameFile
);

/* =========================
   DELETE FILE (SOFT DELETE / TRASH)
   DELETE /files/:id
   ========================= */
router.delete(
  "/:id",
  authMiddleware,
  deleteFile
);

export default router;

