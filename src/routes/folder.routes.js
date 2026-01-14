import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder
} from "../controllers/folder.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createFolder);
router.get("/", authMiddleware, listFolders);
router.put("/:id", authMiddleware, renameFolder);
router.delete("/:id", authMiddleware, deleteFolder);

export default router;
