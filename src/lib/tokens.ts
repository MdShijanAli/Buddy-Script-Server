import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { envVars } from "../config/env";

const ACCESS_TOKEN_SECRET = envVars.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = envVars.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRY = envVars.ACCESS_TOKEN_EXPIRY || "6h";
const REFRESH_TOKEN_EXPIRY = envVars.REFRESH_TOKEN_EXPIRY || "7d";

// Validate secrets exist
if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET environment variable is required");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET environment variable is required");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Generate both tokens
 */
export function generateTokens(payload: TokenPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return null;
  }

  // Check if refresh token is blacklisted
  const isBlacklisted = await isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    return null;
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return null;
  }

  return generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Add token to blacklist (on logout)
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return;
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        expiresAt,
      },
    });

    console.log("✅ Token blacklisted");
  } catch (error) {
    console.error("Failed to blacklist token:", error);
  }
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    return !!blacklistedToken;
  } catch (error) {
    console.error("Failed to check token blacklist:", error);
    return false;
  }
}

/**
 * Clean up expired tokens from blacklist (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧹 Cleaned up ${result.count} expired tokens`);
  } catch (error) {
    console.error("Failed to cleanup expired tokens:", error);
  }
}
