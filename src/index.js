import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Base route (for browser check)
app.get("/", (req, res) => {
  res.send("Cloud Storage Backend is running");
});

// Auth routes
app.use("/auth", authRoutes);

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
