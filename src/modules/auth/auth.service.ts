import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { blacklistToken } from "../../lib/tokens";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

const login = async (payload: LoginPayload) => {
  console.log("Login Payload: ", payload);
  const result = await auth.api.signInEmail({
    body: payload,
  });

  return result;
};

const register = async (payload: RegisterPayload) => {
  // Build the body for BetterAuth
  const authBody: any = {
    email: payload.email,
    password: payload.password,
    name:
      payload.name ||
      `${payload.first_name || ""} ${payload.last_name || ""}`.trim(),
  };

  // Add camelCase fields for BetterAuth
  if (payload.first_name) authBody.firstName = payload.first_name;
  if (payload.last_name) authBody.lastName = payload.last_name;
  if (payload.role) authBody.role = payload.role;

  const result = await auth.api.signUpEmail({
    body: authBody,
  });
  console.log("Register Result: ", result);
  return result;
};

const logout = async (token: string) => {
  // Remove "Bearer " prefix if present
  const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  // Add token to blacklist
  await blacklistToken(cleanToken);

  // Also logout from BetterAuth session
  await auth.api.signOut({
    headers: {
      Authorization: token,
    },
  });
};

export const authService = {
  login,
  register,
  logout,
};
