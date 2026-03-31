import express, { type Application } from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:3000").trim(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Blog Management API");
});

export const PORT = process.env.PORT || 5000;

export default app;
