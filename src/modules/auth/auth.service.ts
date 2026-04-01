import { auth } from "../../lib/auth";
import { blacklistToken } from "../../lib/tokens";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
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
  if (!payload.name && (payload.first_name || payload.last_name)) {
    payload.name =
      `${payload.first_name || ""} ${payload.last_name || ""}`.trim();
  }
  const result = await auth.api.signUpEmail({
    body: payload,
  });
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
