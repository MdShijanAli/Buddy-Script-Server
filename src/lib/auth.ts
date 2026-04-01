import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";

// ------------------------
// BetterAuth Config
// ------------------------

export const auth = betterAuth({
  cookies: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  },

  baseURL: (envVars.BETTER_AUTH_URL || "").trim(),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:3000",
    (envVars.CLIENT_URL || "").trim(),
  ].filter(Boolean),

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER" },
      firstName: { type: "string", required: false, fieldName: "first_name" },
      lastName: { type: "string", required: false, fieldName: "last_name" },
      phone: { type: "string", required: false },
      profileImage: {
        type: "string",
        required: false,
        fieldName: "profile_image",
      },
      isActive: { type: "boolean", defaultValue: true, fieldName: "is_active" },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  // OTP Plugin removed - email verification disabled
  plugins: [],

  // Auto verify email on signup
  callbacks: {
    async onSuccessfulUserCreation({ user }) {
      // Set emailVerified to true immediately
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    },
  },
});
