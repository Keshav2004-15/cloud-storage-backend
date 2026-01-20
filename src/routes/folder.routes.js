import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder,
  getRootFolder,
  getFolderById,
} from "../controllers/folder.controller.js";

const router = express.Router();

/* =========================
   DASHBOARD ROUTES
   ========================= */

// Root folder (My Drive)
router.get("/", authMiddleware, getRootFolder);

// Pagination / listing API (⚠️ MUST be before :id)
router.get("/list/all", authMiddleware, listFolders);

// Open folder by ID
router.get("/:id", authMiddleware, getFolderById);

/* =========================
   FOLDER MANAGEMENT ROUTES
   ========================= */

// Create folder
router.post("/", authMiddleware, createFolder);

// Rename folder
router.put("/:id", authMiddleware, renameFolder);

// Soft delete folder
router.delete("/:id", authMiddleware, deleteFolder);

export default router;
