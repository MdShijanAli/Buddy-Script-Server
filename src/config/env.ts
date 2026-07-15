import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  API_URL: string;
  CLIENT_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVars = [
    "DATABASE_URL",
    "API_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
  ];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(
        `Environment variable ${varName} is required but not set.`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5000",
    API_URL: process.env.API_URL || "http://localhost:3000",
    DATABASE_URL: process.env.DATABASE_URL || "",
    CLIENT_URL:
      process.env.CLIENT_URL || "https://buddy-script-app.netlify.app",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "6h",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "rn5bglqy",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "569637496195194",
    CLOUDINARY_API_SECRET:
      process.env.CLOUDINARY_API_SECRET || "1RIcX1sZSHsp4zYpjQutLSAtIgk",
  };
};

export const envVars = loadEnvVariables();
