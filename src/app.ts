import express, { type Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { notFoundHandler } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";
import { envVars } from "./config/env";
import { authRoutes } from "./modules/auth/auth.route";
import { tokenRoutes } from "./modules/token/token.route";
import { userRoutes } from "./modules/user/user.route";
import { postRoutes } from "./modules/post/post.route";
import { likeRoutes } from "./modules/like/like.route";

dotenv.config();

const app: Application = express();

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: (envVars.CLIENT_URL || "http://localhost:3000").trim(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/token", tokenRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);

app.use("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Buddy Script Server API 🎓",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      token: "/api/token",
      users: "/api/users",
      health: "/api/health",
    },
  });
});

// ==================== ERROR HANDLING ====================
app.use(errorHandler);
app.use(notFoundHandler);

export const PORT = envVars.PORT || 5000;

export default app;
