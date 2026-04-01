import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { envVars } from "../config/env";

// Prevent multiple instances of Prisma Client in serverless
let prisma: PrismaClient;

if (envVars.NODE_ENV === "production") {
  const connectionString = `${envVars.DATABASE_URL}`;
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  // In development, use a global variable to preserve the value across hot reloads
  if (!(global as any).prisma) {
    const connectionString = `${envVars.DATABASE_URL}`;
    const adapter = new PrismaPg({ connectionString });
    (global as any).prisma = new PrismaClient({ adapter });
  }
  prisma = (global as any).prisma;
}

export { prisma };
