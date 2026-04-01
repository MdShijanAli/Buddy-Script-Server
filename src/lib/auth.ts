import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// ------------------------
// BetterAuth Config
// ------------------------

export const auth = betterAuth({
  cookies: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  },

  baseURL: (process.env.BETTER_AUTH_URL || "").trim(),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:3000",
    "https://skill-bridge-client-by-shijan.netlify.app",
    (process.env.APP_URL || "").trim(),
    (process.env.CLIENT_URL || "").trim(),
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
      isBanned: {
        type: "boolean",
        defaultValue: false,
        fieldName: "is_banned",
      },
      bio: { type: "string", required: false },
      location: { type: "string", required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  // ------------------------
  // Google OAuth
  // ------------------------

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
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
