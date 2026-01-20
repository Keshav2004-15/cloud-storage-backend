import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import shareRoutes from "./routes/share.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

/* =========================
   ✅ CORS CONFIGURATION
   ========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite frontend (local)
      "http://localhost:3000", // optional fallback
      "https://cloud-storage-frontend.onrender.com" // future frontend deploy
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/", (req, res) => {
  res.send("Cloud Storage Backend is running");
});

/* =========================
   ROUTES (NO /api PREFIX)
   ========================= */
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/folders", folderRoutes);
app.use("/share", shareRoutes);

/* =========================
   PROTECTED TEST ROUTE
   ========================= */
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

/* =========================
   EXPORT FOR TESTING
   ========================= */
export default app;

/* =========================
   START SERVER
   ========================= */
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
