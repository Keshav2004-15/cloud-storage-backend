import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", authMiddleware, search);

export default router;
