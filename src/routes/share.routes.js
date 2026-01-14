import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createShareLink,
  accessSharedFile,
  revokeShare
} from "../controllers/share.controller.js";

const router = express.Router();

/* Authenticated user creates share */
router.post("/:fileId", authMiddleware, createShareLink);

/* Public access via token */
router.get("/:token", accessSharedFile);

/* Owner revokes share */
router.delete("/:id", authMiddleware, revokeShare);

export default router;
