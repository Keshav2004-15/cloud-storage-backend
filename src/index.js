import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js"; // ✅ ADD THIS
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base route (browser check)
app.get("/", (req, res) => {
  res.send("Cloud Storage Backend is running");
});

// Auth routes (Day-2)
app.use("/auth", authRoutes);

// File routes (Day-3 + Day-4)
app.use("/files", fileRoutes);

// Folder routes (Day-4)
app.use("/folders", folderRoutes);

// Protected test route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
