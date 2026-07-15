import "dotenv/config";
import { defineConfig } from "prisma/config";
import { envVars } from "./src/config/env";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Allow Prisma generate to run in build environments where DATABASE_URL
    // is not injected at install time (for example, Vercel install step).
    url:
      envVars.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
