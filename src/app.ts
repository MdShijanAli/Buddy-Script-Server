import express, { type Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import { notFoundHandler } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";

dotenv.config();

const app: Application = express();

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:3000").trim(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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
    message: "Welcome to SkillBridge API 🎓",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      health: "/api/health",
    },
  });
});

// ==================== ERROR HANDLING ====================
app.use(errorHandler);
app.use(notFoundHandler);

export const PORT = process.env.PORT || 5000;

export default app;
